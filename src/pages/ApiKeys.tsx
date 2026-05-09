import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Key, Copy, Check, Trash2, Plus, AlertTriangle, BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  last_used_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

const ApiKeys = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [busy, setBusy] = useState(false);
  const [newName, setNewName] = useState("");
  const [justCreated, setJustCreated] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  const refresh = async () => {
    const { data } = await supabase
      .from("api_keys" as any)
      .select("id, name, key_prefix, last_used_at, revoked_at, created_at")
      .order("created_at", { ascending: false });
    setKeys((data as any) ?? []);
  };

  useEffect(() => {
    if (user) refresh();
  }, [user]);

  const create = async () => {
    if (!newName.trim()) return;
    setBusy(true);
    const { data, error } = await supabase.rpc("create_api_key" as any, { p_name: newName.trim() });
    setBusy(false);
    if (error || !(data as any)?.success) {
      toast({ title: "Failed to create key", description: (data as any)?.error || error?.message, variant: "destructive" });
      return;
    }
    setJustCreated((data as any).key);
    setNewName("");
    refresh();
  };

  const revoke = async (id: string) => {
    if (!confirm("Revoke this key? Apps using it will stop working immediately.")) return;
    const { data, error } = await supabase.rpc("revoke_api_key" as any, { p_id: id });
    if (error || !(data as any)?.success) {
      toast({ title: "Failed to revoke", description: error?.message, variant: "destructive" });
      return;
    }
    toast({ title: "Key revoked" });
    refresh();
  };

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (loading || !user) return null;

  const active = keys.filter((k) => !k.revoked_at);
  const revoked = keys.filter((k) => k.revoked_at);

  return (
    <div className="cyber-grid min-h-screen py-10">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-heading text-2xl font-bold text-primary neon-text flex items-center gap-2">
              <Key className="h-6 w-6" />
              API Keys
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Use these keys to access TVK Tools programmatically.
            </p>
          </div>
          <Link
            to="/documentation"
            className="inline-flex items-center gap-2 rounded border border-primary/30 px-3 py-2 font-heading text-xs text-primary hover:bg-primary/10"
          >
            <BookOpen className="h-3.5 w-3.5" /> Read the docs
          </Link>
        </div>

        {/* Create form */}
        <div className="mt-6 rounded border border-primary/20 bg-card p-5 border-glow">
          <h2 className="font-heading text-sm font-bold text-foreground">Create new key</h2>
          <div className="mt-3 flex gap-2 flex-wrap">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Production server"
              maxLength={80}
              className="flex-1 min-w-[200px] rounded border border-primary/20 bg-background px-3 py-2 text-sm text-foreground"
            />
            <button
              disabled={busy || !newName.trim()}
              onClick={create}
              className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2 font-heading text-xs font-bold text-primary-foreground disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" />
              {busy ? "Creating..." : "Create key"}
            </button>
          </div>
        </div>

        {/* Just-created secret */}
        {justCreated && (
          <div className="mt-4 rounded border border-yellow-500/40 bg-yellow-500/5 p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-heading text-xs font-bold text-yellow-500">
                  Copy your key now. It won't be shown again.
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <code className="flex-1 truncate rounded bg-background px-3 py-2 text-xs text-foreground border border-primary/20">
                    {justCreated}
                  </code>
                  <button
                    onClick={() => copy(justCreated)}
                    className="rounded border border-primary/30 px-3 py-2 text-xs text-primary hover:bg-primary/10"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <button
                  onClick={() => setJustCreated(null)}
                  className="mt-2 text-[10px] text-muted-foreground underline"
                >
                  I've saved it — dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active keys */}
        <div className="mt-8">
          <h2 className="font-heading text-sm font-bold text-foreground">Active keys ({active.length})</h2>
          {active.length === 0 ? (
            <p className="mt-3 text-xs text-muted-foreground">No active keys yet.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {active.map((k) => (
                <div key={k.id} className="flex items-center justify-between gap-3 rounded border border-primary/10 bg-card p-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="font-heading text-xs font-bold text-foreground truncate">{k.name}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      {k.key_prefix}…  ·  created {new Date(k.created_at).toLocaleDateString()}
                      {k.last_used_at && ` · last used ${new Date(k.last_used_at).toLocaleDateString()}`}
                    </div>
                  </div>
                  <button
                    onClick={() => revoke(k.id)}
                    className="inline-flex items-center gap-1 rounded border border-destructive/30 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3 w-3" /> Revoke
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Revoked */}
        {revoked.length > 0 && (
          <div className="mt-8">
            <h2 className="font-heading text-xs font-bold text-muted-foreground">Revoked</h2>
            <div className="mt-2 space-y-1">
              {revoked.map((k) => (
                <div key={k.id} className="flex items-center justify-between rounded border border-muted/30 bg-muted/10 px-3 py-2 text-[11px] text-muted-foreground">
                  <span className="truncate">{k.name} · {k.key_prefix}…</span>
                  <span>revoked {new Date(k.revoked_at!).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiKeys;
