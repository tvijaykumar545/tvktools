import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Plus, Save, Trash2, Edit2, Eye, Palette } from "lucide-react";
import { toast } from "sonner";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  heading: string;
  body_text: string;
  button_text: string;
  button_url: string;
  footer_text: string;
  accent_color: string;
  created_at: string;
}

const DEFAULT_TEMPLATE: Omit<EmailTemplate, "id" | "created_at"> = {
  name: "",
  subject: "",
  heading: "",
  body_text: "",
  button_text: "",
  button_url: "",
  footer_text: "This message was sent by the tvktools team.",
  accent_color: "#00ffff",
};

const ACCENT_PRESETS = ["#00ffff", "#ff00ff", "#00ff88", "#fbbf24", "#f43f5e", "#6366f1"];

const AdminEmailTemplates = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();

  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [editing, setEditing] = useState<Omit<EmailTemplate, "id" | "created_at"> & { id?: string } | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !adminLoading) {
      if (!user) navigate("/login");
      else if (!isAdmin) navigate("/dashboard");
    }
  }, [user, isAdmin, authLoading, adminLoading, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchTemplates();
  }, [isAdmin]);

  const fetchTemplates = async () => {
    const { data } = await supabase
      .from("email_templates")
      .select("*")
      .order("created_at", { ascending: false });
    setTemplates((data as EmailTemplate[]) || []);
  };

  const handleNew = () => {
    setEditing({ ...DEFAULT_TEMPLATE });
    setPreviewing(false);
  };

  const handleEdit = (tpl: EmailTemplate) => {
    setEditing({ ...tpl });
    setPreviewing(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this template?")) return;
    await supabase.from("email_templates").delete().eq("id", id);
    toast.success("Template deleted");
    fetchTemplates();
    if (editing && "id" in editing && editing.id === id) setEditing(null);
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.name.trim()) return toast.error("Template name is required");
    if (!editing.subject.trim()) return toast.error("Subject is required");

    setSaving(true);
    if (editing.id) {
      const { error } = await supabase
        .from("email_templates")
        .update({
          name: editing.name,
          subject: editing.subject,
          heading: editing.heading,
          body_text: editing.body_text,
          button_text: editing.button_text,
          button_url: editing.button_url,
          footer_text: editing.footer_text,
          accent_color: editing.accent_color,
        })
        .eq("id", editing.id);
      if (error) toast.error("Save failed");
      else toast.success("Template updated");
    } else {
      const { error } = await supabase.from("email_templates").insert({
        name: editing.name,
        subject: editing.subject,
        heading: editing.heading,
        body_text: editing.body_text,
        button_text: editing.button_text || "",
        button_url: editing.button_url || "",
        footer_text: editing.footer_text,
        accent_color: editing.accent_color,
        created_by: user!.id,
      });
      if (error) toast.error("Save failed");
      else toast.success("Template created");
    }
    setSaving(false);
    fetchTemplates();
  };

  const updateField = (field: string, value: string) => {
    if (!editing) return;
    setEditing({ ...editing, [field]: value });
  };

  if (authLoading || adminLoading) {
    return <div className="flex min-h-screen items-center justify-center"><div className="font-heading text-sm text-primary animate-pulse-neon">Loading...</div></div>;
  }
  if (!isAdmin) return null;

  return (
    <div className="cyber-grid min-h-screen py-8">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <Palette className="h-6 w-6 text-primary" />
            <h1 className="font-heading text-2xl font-bold text-primary neon-text">Email Templates</h1>
          </div>
          <button
            onClick={handleNew}
            className="flex items-center gap-2 rounded bg-primary px-4 py-2 font-heading text-xs font-bold text-primary-foreground neon-glow transition-all hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> New Template
          </button>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Design and save reusable email templates</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-5">
          {/* Left: Template list */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="font-heading text-sm font-bold text-foreground">Saved Templates ({templates.length})</h2>
            {templates.length === 0 && (
              <div className="rounded border border-primary/20 bg-card p-6 text-center">
                <p className="text-xs text-muted-foreground">No templates yet. Create your first one!</p>
              </div>
            )}
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className={`rounded border bg-card p-4 transition-all cursor-pointer ${
                  editing?.id === tpl.id ? "border-primary/50 bg-primary/5" : "border-primary/20 hover:border-primary/30"
                }`}
                onClick={() => handleEdit(tpl)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: tpl.accent_color }} />
                      <span className="font-heading text-sm font-bold text-foreground truncate">{tpl.name}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 truncate">{tpl.subject}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); handleEdit(tpl); }} className="p-1.5 text-muted-foreground hover:text-primary transition-colors">
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(tpl.id); }} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Editor / Preview */}
          <div className="lg:col-span-3">
            {!editing ? (
              <div className="rounded border border-primary/20 bg-card p-12 text-center">
                <Palette className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">Select a template to edit or create a new one</p>
              </div>
            ) : (
              <div className="rounded border border-primary/20 bg-card">
                {/* Tabs */}
                <div className="flex border-b border-primary/20">
                  <button
                    onClick={() => setPreviewing(false)}
                    className={`flex-1 py-3 font-heading text-xs font-bold transition-all ${
                      !previewing ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Edit2 className="h-3.5 w-3.5 inline mr-1.5" /> Design
                  </button>
                  <button
                    onClick={() => setPreviewing(true)}
                    className={`flex-1 py-3 font-heading text-xs font-bold transition-all ${
                      previewing ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Eye className="h-3.5 w-3.5 inline mr-1.5" /> Preview
                  </button>
                </div>

                {!previewing ? (
                  <div className="p-4 space-y-4">
                    {/* Name */}
                    <div>
                      <label className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Template Name</label>
                      <input type="text" value={editing.name} onChange={(e) => updateField("name", e.target.value)} placeholder="e.g. Welcome Offer" className="mt-1 h-9 w-full rounded border border-primary/20 bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50" />
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Email Subject</label>
                      <input type="text" value={editing.subject} onChange={(e) => updateField("subject", e.target.value)} placeholder="Subject line..." className="mt-1 h-9 w-full rounded border border-primary/20 bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50" />
                    </div>

                    {/* Accent Color */}
                    <div>
                      <label className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Accent Color</label>
                      <div className="mt-1 flex items-center gap-2">
                        {ACCENT_PRESETS.map((c) => (
                          <button
                            key={c}
                            onClick={() => updateField("accent_color", c)}
                            className={`h-7 w-7 rounded-full border-2 transition-all ${editing.accent_color === c ? "border-foreground scale-110" : "border-transparent"}`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                        <input type="color" value={editing.accent_color} onChange={(e) => updateField("accent_color", e.target.value)} className="h-7 w-7 rounded cursor-pointer border-0 bg-transparent" />
                      </div>
                    </div>

                    {/* Heading */}
                    <div>
                      <label className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Heading</label>
                      <input type="text" value={editing.heading} onChange={(e) => updateField("heading", e.target.value)} placeholder="Email heading..." className="mt-1 h-9 w-full rounded border border-primary/20 bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50" />
                    </div>

                    {/* Body */}
                    <div>
                      <label className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Body Text</label>
                      <textarea value={editing.body_text} onChange={(e) => updateField("body_text", e.target.value)} rows={5} placeholder="Main message content..." className="mt-1 w-full rounded border border-primary/20 bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 resize-none" />
                      <p className="text-[10px] text-muted-foreground mt-0.5">Use {"{{name}}"} to insert the recipient's name</p>
                    </div>

                    {/* Button */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Button Text (optional)</label>
                        <input type="text" value={editing.button_text} onChange={(e) => updateField("button_text", e.target.value)} placeholder="e.g. Visit Dashboard" className="mt-1 h-9 w-full rounded border border-primary/20 bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50" />
                      </div>
                      <div>
                        <label className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Button URL</label>
                        <input type="text" value={editing.button_url} onChange={(e) => updateField("button_url", e.target.value)} placeholder="https://..." className="mt-1 h-9 w-full rounded border border-primary/20 bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50" />
                      </div>
                    </div>

                    {/* Footer */}
                    <div>
                      <label className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Footer Text</label>
                      <input type="text" value={editing.footer_text} onChange={(e) => updateField("footer_text", e.target.value)} placeholder="Footer message..." className="mt-1 h-9 w-full rounded border border-primary/20 bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50" />
                    </div>

                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex w-full items-center justify-center gap-2 rounded bg-primary py-3 font-heading text-xs font-bold text-primary-foreground neon-glow disabled:opacity-50 transition-all"
                    >
                      <Save className="h-4 w-4" />
                      {saving ? "Saving..." : editing.id ? "Update Template" : "Save Template"}
                    </button>
                  </div>
                ) : (
                  /* Preview */
                  <div className="p-4">
                    <div className="rounded border border-primary/10 overflow-hidden">
                      {/* Email preview */}
                      <div style={{ backgroundColor: "#ffffff", fontFamily: "'Space Mono', 'Courier New', Courier, monospace" }}>
                        {/* Header */}
                        <div style={{ backgroundColor: "#0a0a14", padding: "24px 25px", textAlign: "center" }}>
                          <span style={{ color: editing.accent_color, fontSize: "20px", fontWeight: "bold", letterSpacing: "2px" }}>⚡ tvktools</span>
                        </div>
                        {/* Content */}
                        <div style={{ padding: "30px 25px" }}>
                          {editing.heading && (
                            <h2 style={{ fontSize: "22px", fontWeight: "bold", color: "#0a0a14", margin: "0 0 20px" }}>{editing.heading}</h2>
                          )}
                          <p style={{ fontSize: "14px", color: "#333333", lineHeight: "1.7", margin: "0 0 20px", whiteSpace: "pre-wrap" }}>
                            {editing.body_text || "Your message content will appear here..."}
                          </p>
                          {editing.button_text && (
                            <div style={{ textAlign: "center", margin: "24px 0" }}>
                              <span style={{
                                display: "inline-block",
                                padding: "12px 28px",
                                backgroundColor: editing.accent_color,
                                color: "#0a0a14",
                                fontWeight: "bold",
                                fontSize: "13px",
                                borderRadius: "4px",
                                textDecoration: "none",
                                letterSpacing: "1px",
                              }}>
                                {editing.button_text}
                              </span>
                            </div>
                          )}
                          {editing.footer_text && (
                            <>
                              <hr style={{ borderColor: "#e0e0e0", margin: "20px 0" }} />
                              <p style={{ fontSize: "12px", color: "#999999", margin: 0 }}>{editing.footer_text}</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-3 text-center">This is an approximate preview. Actual email may vary slightly.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEmailTemplates;
