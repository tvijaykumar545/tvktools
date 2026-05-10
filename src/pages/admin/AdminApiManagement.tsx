import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Shield,
  Key,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Wrench,
  Search,
  ArrowLeft,
} from "lucide-react";

type ApiKeyRow = {
  id: string;
  name: string;
  key_prefix: string;
  user_id: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
  expires_at: string | null;
};

type RequestLog = {
  id: string;
  api_key_id: string;
  user_id: string;
  endpoint: string;
  method: string;
  status: number;
  points_charged: number;
  created_at: string;
};

type ManagedTool = {
  id: string;
  name: string;
  category: string;
  type: string;
  is_active: boolean;
  is_free: boolean;
  points_cost: number;
};

const AdminApiManagement = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();

  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [tools, setTools] = useState<ManagedTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [windowHours, setWindowHours] = useState<24 | 168 | 720>(24);

  useEffect(() => {
    if (!authLoading && !adminLoading) {
      if (!user) navigate("/login");
      else if (!isAdmin) navigate("/dashboard");
    }
  }, [user, isAdmin, authLoading, adminLoading, navigate]);

  const fetchAll = async () => {
    setLoading(true);
    const since = new Date(Date.now() - windowHours * 3600 * 1000).toISOString();
    const [keysRes, logsRes, toolsRes] = await Promise.all([
      supabase
        .from("api_keys")
        .select("id, name, key_prefix, user_id, created_at, last_used_at, revoked_at, expires_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("api_request_log")
        .select("id, api_key_id, user_id, endpoint, method, status, points_charged, created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(1000),
      supabase
        .from("managed_tools")
        .select("id, name, category, type, is_active, is_free, points_cost")
        .order("category", { ascending: true })
        .order("name", { ascending: true }),
    ]);
    setKeys((keysRes.data as any) ?? []);
    setLogs((logsRes.data as any) ?? []);
    setTools((toolsRes.data as any) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, windowHours]);

  const stats = useMemo(() => {
    const total = logs.length;
    const errors = logs.filter((l) => l.status >= 400).length;
    const pointsCharged = logs.reduce((s, l) => s + (l.points_charged || 0), 0);
    const activeKeys = keys.filter((k) => !k.revoked_at).length;
    const errorRate = total ? (errors / total) * 100 : 0;
    return { total, errors, pointsCharged, activeKeys, errorRate };
  }, [logs, keys]);

  const usagePerKey = useMemo(() => {
    const map = new Map<string, { count: number; errors: number; points: number }>();
    for (const l of logs) {
      const cur = map.get(l.api_key_id) || { count: 0, errors: 0, points: 0 };
      cur.count++;
      if (l.status >= 400) cur.errors++;
      cur.points += l.points_charged || 0;
      map.set(l.api_key_id, cur);
    }
    return map;
  }, [logs]);

  const filteredKeys = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return keys;
    return keys.filter(
      (k) =>
        k.name.toLowerCase().includes(q) ||
        k.key_prefix.toLowerCase().includes(q) ||
        k.user_id.toLowerCase().includes(q),
    );
  }, [keys, search]);

  const toggleToolActive = async (id: string, next: boolean) => {
    const { error } = await supabase
      .from("managed_tools")
      .update({ is_active: next })
      .eq("id", id);
    if (error) {
      toast({ title: "Failed to update tool", description: error.message, variant: "destructive" });
      return;
    }
    setTools((prev) => prev.map((t) => (t.id === id ? { ...t, is_active: next } : t)));
    toast({ title: next ? "Tool enabled" : "Tool disabled" });
  };

  if (authLoading || adminLoading || !isAdmin) return null;

  return (
    <div className="cyber-grid min-h-screen py-8">
      <div className="container mx-auto px-4">
        <Link
          to="/admin"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-3 w-3" /> Admin
        </Link>

        <div className="mt-3 flex items-center gap-3">
          <Shield className="h-6 w-6 text-secondary" />
          <h1 className="font-heading text-2xl font-bold text-secondary neon-text-magenta">
            API Management
          </h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitor keys, request volume, and tool availability across all users.
        </p>

        {/* Window selector */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="font-heading text-[10px] font-bold uppercase text-muted-foreground">
            Window
          </span>
          {([
            [24, "24h"],
            [168, "7d"],
            [720, "30d"],
          ] as const).map(([h, label]) => (
            <button
              key={h}
              onClick={() => setWindowHours(h)}
              className={`rounded px-3 py-1 font-heading text-[10px] font-semibold transition-all ${
                windowHours === h
                  ? "bg-primary text-primary-foreground neon-glow"
                  : "border border-primary/20 text-muted-foreground hover:text-primary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Key}
            label="Active Keys"
            value={stats.activeKeys}
            sub={`${keys.length} total`}
          />
          <StatCard
            icon={Activity}
            label="Requests"
            value={stats.total}
            sub={`in last ${windowHours === 24 ? "24h" : windowHours === 168 ? "7d" : "30d"}`}
          />
          <StatCard
            icon={AlertTriangle}
            label="Error Rate"
            value={`${stats.errorRate.toFixed(1)}%`}
            sub={`${stats.errors} failed`}
            tone={stats.errorRate > 5 ? "danger" : "ok"}
          />
          <StatCard
            icon={Wrench}
            label="Points Charged"
            value={stats.pointsCharged}
            sub="via API"
          />
        </div>

        {/* API Keys */}
        <section className="mt-10">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h2 className="font-heading text-lg font-bold text-foreground">API Keys</h2>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, prefix, user…"
                className="h-8 w-64 rounded border border-primary/20 bg-card pl-7 pr-3 text-xs text-foreground outline-none focus:border-primary/50"
              />
            </div>
          </div>

          <div className="mt-3 overflow-x-auto rounded border border-primary/10 bg-card">
            <table className="w-full text-xs">
              <thead className="bg-muted/20 text-left font-heading text-[10px] uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Prefix</th>
                  <th className="px-3 py-2">User</th>
                  <th className="px-3 py-2 text-right">Requests</th>
                  <th className="px-3 py-2 text-right">Errors</th>
                  <th className="px-3 py-2 text-right">Points</th>
                  <th className="px-3 py-2">Last used</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={8} className="px-3 py-6 text-center text-muted-foreground">
                      Loading…
                    </td>
                  </tr>
                )}
                {!loading && filteredKeys.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-3 py-6 text-center text-muted-foreground">
                      No keys match.
                    </td>
                  </tr>
                )}
                {filteredKeys.map((k) => {
                  const u = usagePerKey.get(k.id);
                  const revoked = !!k.revoked_at;
                  return (
                    <tr key={k.id} className="border-t border-primary/5 hover:bg-primary/5">
                      <td className="px-3 py-2 font-heading font-bold text-foreground">{k.name}</td>
                      <td className="px-3 py-2 font-mono text-[10px] text-muted-foreground">
                        {k.key_prefix}…
                      </td>
                      <td className="px-3 py-2 font-mono text-[10px] text-muted-foreground">
                        {k.user_id.slice(0, 8)}…
                      </td>
                      <td className="px-3 py-2 text-right">{u?.count ?? 0}</td>
                      <td
                        className={`px-3 py-2 text-right ${
                          (u?.errors ?? 0) > 0 ? "text-destructive" : ""
                        }`}
                      >
                        {u?.errors ?? 0}
                      </td>
                      <td className="px-3 py-2 text-right">{u?.points ?? 0}</td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {k.last_used_at
                          ? new Date(k.last_used_at).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-3 py-2">
                        {revoked ? (
                          <span className="inline-flex items-center gap-1 text-destructive">
                            <XCircle className="h-3 w-3" /> Revoked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-primary">
                            <CheckCircle2 className="h-3 w-3" /> Active
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Tool availability */}
        <section className="mt-10 mb-10">
          <h2 className="font-heading text-lg font-bold text-foreground">Tool Availability</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Disabled tools reject API calls and hide from the public catalog.
          </p>

          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-3 rounded border border-primary/10 bg-card p-3"
              >
                <div className="min-w-0">
                  <div className="font-heading text-xs font-bold text-foreground truncate">
                    {t.name}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {t.category} · {t.type} · {t.is_free ? "free" : `${t.points_cost} pts`}
                  </div>
                </div>
                <button
                  onClick={() => toggleToolActive(t.id, !t.is_active)}
                  className={`rounded px-2.5 py-1 font-heading text-[10px] font-semibold transition-all ${
                    t.is_active
                      ? "bg-primary/15 text-primary hover:bg-primary/25"
                      : "bg-destructive/15 text-destructive hover:bg-destructive/25"
                  }`}
                >
                  {t.is_active ? "Active" : "Disabled"}
                </button>
              </div>
            ))}
            {!loading && tools.length === 0 && (
              <div className="text-xs text-muted-foreground">No tools configured.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  sub,
  tone = "ok",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  sub?: string;
  tone?: "ok" | "danger";
}) => (
  <div
    className={`rounded border bg-card p-4 ${
      tone === "danger" ? "border-destructive/30" : "border-primary/15"
    }`}
  >
    <div className="flex items-center gap-2">
      <Icon
        className={`h-4 w-4 ${tone === "danger" ? "text-destructive" : "text-primary"}`}
      />
      <span className="font-heading text-[10px] uppercase text-muted-foreground">
        {label}
      </span>
    </div>
    <div className="mt-2 font-heading text-2xl font-bold text-foreground">{value}</div>
    {sub && <div className="mt-1 text-[10px] text-muted-foreground">{sub}</div>}
  </div>
);

export default AdminApiManagement;
