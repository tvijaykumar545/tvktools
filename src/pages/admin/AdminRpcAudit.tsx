// @ts-nocheck
import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Shield, ArrowLeft, RefreshCw, CheckCircle2, XCircle, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AuditRow = {
  id: string;
  created_at: string;
  function_name: string;
  caller_user_id: string | null;
  args: any;
  success: boolean;
  error_message: string | null;
};

const WINDOWS: Record<string, number> = {
  "1h": 1,
  "24h": 24,
  "7d": 24 * 7,
  "30d": 24 * 30,
};

const AdminRpcAudit = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();

  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [windowKey, setWindowKey] = useState<string>("24h");
  const [fnFilter, setFnFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!authLoading && !adminLoading) {
      if (!user) navigate("/login");
      else if (!isAdmin) navigate("/dashboard");
    }
  }, [user, isAdmin, authLoading, adminLoading, navigate]);

  const fetchRows = async () => {
    setLoading(true);
    const hours = WINDOWS[windowKey] ?? 24;
    const since = new Date(Date.now() - hours * 3600 * 1000).toISOString();
    const { data, error } = await supabase
      .from("rpc_audit_log")
      .select("id, created_at, function_name, caller_user_id, args, success, error_message")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(1000);
    if (!error && data) setRows(data as AuditRow[]);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchRows();
  }, [isAdmin, windowKey]);

  const functionNames = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => set.add(r.function_name));
    return Array.from(set).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (fnFilter !== "all" && r.function_name !== fnFilter) return false;
      if (statusFilter === "success" && !r.success) return false;
      if (statusFilter === "failure" && r.success) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = [
          r.function_name,
          r.caller_user_id ?? "",
          r.error_message ?? "",
          JSON.stringify(r.args ?? {}),
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, fnFilter, statusFilter, search]);

  const stats = useMemo(() => {
    const total = rows.length;
    const failures = rows.filter((r) => !r.success).length;
    const uniqueCallers = new Set(rows.map((r) => r.caller_user_id).filter(Boolean)).size;
    const uniqueFns = new Set(rows.map((r) => r.function_name)).size;
    return { total, failures, uniqueCallers, uniqueFns };
  }, [rows]);

  if (authLoading || adminLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="font-heading text-sm text-primary animate-pulse-neon">Loading...</div>
      </div>
    );
  }
  if (!isAdmin) return null;

  return (
    <div className="cyber-grid min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="text-muted-foreground hover:text-primary">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <Shield className="h-6 w-6 text-secondary" />
            <h1 className="font-heading text-2xl font-bold text-secondary neon-text-magenta">
              RPC Audit Log
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Select value={windowKey} onValueChange={setWindowKey}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last 1h</SelectItem>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7d</SelectItem>
                <SelectItem value="30d">Last 30d</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={fetchRows} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Every client-callable database function logs an entry here — success or validation failure.
        </p>

        {/* Stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-primary/20 border-glow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" /> Total Calls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-heading text-2xl font-bold text-foreground">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="border-destructive/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground flex items-center gap-2">
                <XCircle className="h-4 w-4 text-destructive" /> Failures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-heading text-2xl font-bold text-destructive">
                {stats.failures}
              </div>
            </CardContent>
          </Card>
          <Card className="border-secondary/20 neon-glow-magenta">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground">Unique Callers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-heading text-2xl font-bold text-foreground">
                {stats.uniqueCallers}
              </div>
            </CardContent>
          </Card>
          <Card className="border-primary/20 border-glow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground">Unique Functions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-heading text-2xl font-bold text-foreground">
                {stats.uniqueFns}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap gap-2 items-center">
          <Input
            placeholder="Search caller, args, error…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Select value={fnFilter} onValueChange={setFnFilter}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Function" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All functions</SelectItem>
              {functionNames.map((n) => (
                <SelectItem key={n} value={n}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All outcomes</SelectItem>
              <SelectItem value="success">Success only</SelectItem>
              <SelectItem value="failure">Failures only</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-xs text-muted-foreground ml-auto">
            Showing {filtered.length} of {rows.length}
          </div>
        </div>

        {/* Table */}
        <div className="mt-4 rounded border border-primary/10 bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Function</TableHead>
                <TableHead>Caller</TableHead>
                <TableHead>Args</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No audit entries in this window.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => (
                  <TableRow key={r.id} className={!r.success ? "bg-destructive/5" : undefined}>
                    <TableCell className="font-mono text-xs whitespace-nowrap">
                      {new Date(r.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{r.function_name}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {r.caller_user_id ? r.caller_user_id.slice(0, 8) + "…" : "—"}
                    </TableCell>
                    <TableCell className="font-mono text-xs max-w-[280px] truncate" title={JSON.stringify(r.args)}>
                      {r.args ? JSON.stringify(r.args) : "—"}
                    </TableCell>
                    <TableCell>
                      {r.success ? (
                        <Badge variant="outline" className="text-primary border-primary/40">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> ok
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" /> fail
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-destructive max-w-[260px] truncate" title={r.error_message ?? ""}>
                      {r.error_message ?? "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default AdminRpcAudit;
