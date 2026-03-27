import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Plus, Save, Trash2, Edit2, Eye, Palette, Code, Settings2, Copy, LayoutGrid } from "lucide-react";
import EmailBlockEditor, { type EmailBlock, blocksToHtml } from "@/components/EmailBlockEditor";
import { toast } from "sonner";

type EditorMode = "variables" | "html" | "both" | "blocks";

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
  html_content: string;
  editor_mode: string;
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
  html_content: "",
  editor_mode: "variables",
};

const ACCENT_PRESETS = ["#00ffff", "#ff00ff", "#00ff88", "#fbbf24", "#f43f5e", "#6366f1"];

const STARTER_HTML = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:'Space Mono','Courier New',Courier,monospace">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto">
    <tr><td style="background:#0a0a14;padding:24px 25px;text-align:center">
      <span style="color:#00ffff;font-size:20px;font-weight:bold;letter-spacing:2px">⚡ tvktools</span>
    </td></tr>
    <tr><td style="padding:30px 25px">
      <h1 style="font-size:22px;font-weight:bold;color:#0a0a14;margin:0 0 20px">Your Heading Here</h1>
      <p style="font-size:14px;color:#333;line-height:1.7;margin:0 0 20px">Your message content goes here...</p>
      <div style="text-align:center;margin:24px 0">
        <a href="https://tvktools.lovable.app" style="display:inline-block;padding:12px 28px;background:#00ffff;color:#0a0a14;font-weight:bold;font-size:13px;border-radius:4px;text-decoration:none;letter-spacing:1px">CLICK HERE</a>
      </div>
      <hr style="border-color:#e0e0e0;margin:20px 0">
      <p style="font-size:12px;color:#999;margin:0">This message was sent by the tvktools team.</p>
    </td></tr>
  </table>
</body>
</html>`;

const generatePreviewHtml = (tpl: Omit<EmailTemplate, "id" | "created_at"> & { id?: string }) => {
  return `<!DOCTYPE html><html><head></head><body style="margin:0;padding:0;background:#ffffff;font-family:'Space Mono','Courier New',Courier,monospace">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto">
<tr><td style="background:#0a0a14;padding:24px 25px;text-align:center">
<span style="color:${tpl.accent_color};font-size:20px;font-weight:bold;letter-spacing:2px">⚡ tvktools</span>
</td></tr>
<tr><td style="padding:30px 25px">
${tpl.heading ? `<h1 style="font-size:22px;font-weight:bold;color:#0a0a14;margin:0 0 20px">${tpl.heading}</h1>` : ""}
<p style="font-size:14px;color:#333;line-height:1.7;margin:0 0 20px;white-space:pre-wrap">${tpl.body_text || "Your message content will appear here..."}</p>
${tpl.button_text ? `<div style="text-align:center;margin:24px 0"><a href="${tpl.button_url || "#"}" style="display:inline-block;padding:12px 28px;background:${tpl.accent_color};color:#0a0a14;font-weight:bold;font-size:13px;border-radius:4px;text-decoration:none;letter-spacing:1px">${tpl.button_text}</a></div>` : ""}
${tpl.footer_text ? `<hr style="border-color:#e0e0e0;margin:20px 0"><p style="font-size:12px;color:#999;margin:0">${tpl.footer_text}</p>` : ""}
</td></tr></table></body></html>`;
};

const AdminEmailTemplates = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();

  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [editing, setEditing] = useState<Omit<EmailTemplate, "id" | "created_at"> & { id?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [editorMode, setEditorMode] = useState<EditorMode>("variables");
  const [saving, setSaving] = useState(false);
  const [blocks, setBlocks] = useState<EmailBlock[]>([]);

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
    setEditorMode("variables");
    setActiveTab("edit");
  };

  const handleEdit = (tpl: EmailTemplate) => {
    setEditing({ ...tpl });
    setEditorMode((tpl.editor_mode as EditorMode) || "variables");
    setActiveTab("edit");
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
    if (editorMode === "html" && !editing.html_content.trim()) return toast.error("HTML content is required");

    setSaving(true);
    const payload = {
      name: editing.name,
      subject: editing.subject,
      heading: editing.heading,
      body_text: editing.body_text,
      button_text: editing.button_text || "",
      button_url: editing.button_url || "",
      footer_text: editing.footer_text,
      accent_color: editing.accent_color,
      html_content: editing.html_content || "",
      editor_mode: editorMode,
    };

    if (editing.id) {
      const { error } = await supabase.from("email_templates").update(payload).eq("id", editing.id);
      if (error) toast.error("Save failed");
      else toast.success("Template updated");
    } else {
      const { error } = await supabase.from("email_templates").insert({ ...payload, created_by: user!.id });
      if (error) toast.error("Save failed");
      else toast.success("Template created");
    }
    setSaving(false);
    fetchTemplates();
  };

  const handleDuplicate = (tpl: EmailTemplate) => {
    const { id, created_at, ...rest } = tpl;
    setEditing({ ...rest, name: `${rest.name} (copy)` });
    setEditorMode((rest.editor_mode as EditorMode) || "variables");
    setActiveTab("edit");
  };

  const insertStarterHtml = () => {
    if (!editing) return;
    setEditing({ ...editing, html_content: STARTER_HTML });
  };

  const updateField = (field: string, value: string) => {
    if (!editing) return;
    setEditing({ ...editing, [field]: value });
  };

  if (authLoading || adminLoading) {
    return <div className="flex min-h-screen items-center justify-center"><div className="font-heading text-sm text-primary animate-pulse-neon">Loading...</div></div>;
  }
  if (!isAdmin) return null;

  const modeLabel = { variables: "Variables", html: "HTML", both: "Both" };
  const modeIcon = { variables: <Settings2 className="h-3.5 w-3.5" />, html: <Code className="h-3.5 w-3.5" />, both: <Palette className="h-3.5 w-3.5" /> };

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
          <button onClick={handleNew} className="flex items-center gap-2 rounded bg-primary px-4 py-2 font-heading text-xs font-bold text-primary-foreground neon-glow transition-all hover:opacity-90">
            <Plus className="h-4 w-4" /> New Template
          </button>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Design and save reusable email templates with variable fields, custom HTML, or both</p>

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
                className={`rounded border bg-card p-4 transition-all cursor-pointer ${editing?.id === tpl.id ? "border-primary/50 bg-primary/5" : "border-primary/20 hover:border-primary/30"}`}
                onClick={() => handleEdit(tpl)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: tpl.accent_color }} />
                      <span className="font-heading text-sm font-bold text-foreground truncate">{tpl.name}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-heading uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                        {tpl.editor_mode || "variables"}
                      </span>
                      <p className="text-[11px] text-muted-foreground truncate">{tpl.subject}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); handleDuplicate(tpl); }} className="p-1.5 text-muted-foreground hover:text-primary transition-colors" title="Duplicate">
                      <Copy className="h-3.5 w-3.5" />
                    </button>
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
                {/* Editor Mode Selector */}
                <div className="flex items-center gap-2 px-4 pt-4 pb-2">
                  <span className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Editor Mode:</span>
                  {(["variables", "html", "both"] as EditorMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setEditorMode(mode)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-heading text-[10px] font-bold uppercase tracking-wider transition-all ${
                        editorMode === mode
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/50 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {modeIcon[mode]} {modeLabel[mode]}
                    </button>
                  ))}
                </div>

                {/* Tabs: Edit / Preview */}
                <div className="flex border-b border-primary/20">
                  <button
                    onClick={() => setActiveTab("edit")}
                    className={`flex-1 py-3 font-heading text-xs font-bold transition-all ${!activeTab || activeTab === "edit" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <Edit2 className="h-3.5 w-3.5 inline mr-1.5" /> Design
                  </button>
                  <button
                    onClick={() => setActiveTab("preview")}
                    className={`flex-1 py-3 font-heading text-xs font-bold transition-all ${activeTab === "preview" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <Eye className="h-3.5 w-3.5 inline mr-1.5" /> Preview
                  </button>
                </div>

                {activeTab === "edit" ? (
                  <div className="p-4 space-y-4">
                    {/* Common fields: Name, Subject, Accent Color */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Template Name</label>
                        <input type="text" value={editing.name} onChange={(e) => updateField("name", e.target.value)} placeholder="e.g. Welcome Offer" className="mt-1 h-9 w-full rounded border border-primary/20 bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50" />
                      </div>
                      <div>
                        <label className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Email Subject</label>
                        <input type="text" value={editing.subject} onChange={(e) => updateField("subject", e.target.value)} placeholder="Subject line..." className="mt-1 h-9 w-full rounded border border-primary/20 bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50" />
                      </div>
                    </div>

                    {/* Accent Color - shown for variables & both */}
                    {(editorMode === "variables" || editorMode === "both") && (
                      <div>
                        <label className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Accent Color</label>
                        <div className="mt-1 flex items-center gap-2">
                          {ACCENT_PRESETS.map((c) => (
                            <button key={c} onClick={() => updateField("accent_color", c)} className={`h-7 w-7 rounded-full border-2 transition-all ${editing.accent_color === c ? "border-foreground scale-110" : "border-transparent"}`} style={{ backgroundColor: c }} />
                          ))}
                          <input type="color" value={editing.accent_color} onChange={(e) => updateField("accent_color", e.target.value)} className="h-7 w-7 rounded cursor-pointer border-0 bg-transparent" />
                        </div>
                      </div>
                    )}

                    {/* Variable-based fields */}
                    {(editorMode === "variables" || editorMode === "both") && (
                      <div className="space-y-4">
                        {editorMode === "both" && (
                          <div className="flex items-center gap-2 pt-1">
                            <Settings2 className="h-3.5 w-3.5 text-primary" />
                            <span className="font-heading text-[10px] font-bold uppercase tracking-wider text-primary">Variable Fields</span>
                          </div>
                        )}
                        <div>
                          <label className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Heading</label>
                          <input type="text" value={editing.heading} onChange={(e) => updateField("heading", e.target.value)} placeholder="Email heading..." className="mt-1 h-9 w-full rounded border border-primary/20 bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50" />
                        </div>
                        <div>
                          <label className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Body Text</label>
                          <textarea value={editing.body_text} onChange={(e) => updateField("body_text", e.target.value)} rows={4} placeholder="Main message content..." className="mt-1 w-full rounded border border-primary/20 bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 resize-none" />
                          <p className="text-[10px] text-muted-foreground mt-0.5">Use {"{{name}}"} to insert the recipient's name</p>
                        </div>
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
                        <div>
                          <label className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Footer Text</label>
                          <input type="text" value={editing.footer_text} onChange={(e) => updateField("footer_text", e.target.value)} placeholder="Footer message..." className="mt-1 h-9 w-full rounded border border-primary/20 bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50" />
                        </div>
                      </div>
                    )}

                    {/* HTML Editor */}
                    {(editorMode === "html" || editorMode === "both") && (
                      <div className="space-y-2">
                        {editorMode === "both" && (
                          <div className="flex items-center gap-2 pt-2 border-t border-primary/10">
                            <Code className="h-3.5 w-3.5 text-primary" />
                            <span className="font-heading text-[10px] font-bold uppercase tracking-wider text-primary">HTML Editor</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <label className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Custom HTML</label>
                          {!editing.html_content.trim() && (
                            <button onClick={insertStarterHtml} className="text-[10px] font-heading text-primary hover:underline">
                              Insert starter template →
                            </button>
                          )}
                        </div>
                        <textarea
                          value={editing.html_content}
                          onChange={(e) => updateField("html_content", e.target.value)}
                          rows={editorMode === "html" ? 16 : 10}
                          placeholder="<html>...</html>"
                          spellCheck={false}
                          className="mt-1 w-full rounded border border-primary/20 bg-[hsl(var(--card))] p-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 resize-y font-mono leading-relaxed"
                        />
                        <p className="text-[10px] text-muted-foreground">
                          {editorMode === "both"
                            ? "When HTML is provided, it takes priority over variable fields for the email body."
                            : "Write your full email HTML. Use {{name}} for recipient name, {{subject}} for subject."}
                        </p>
                      </div>
                    )}

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
                    <div className="rounded border border-primary/10 overflow-hidden bg-white">
                      {(editorMode === "html" || (editorMode === "both" && editing.html_content.trim())) ? (
                        <iframe
                          srcDoc={editing.html_content || "<p style='padding:20px;color:#999;font-family:monospace'>No HTML content yet</p>"}
                          className="w-full border-0"
                          style={{ minHeight: "400px" }}
                          sandbox="allow-same-origin"
                          title="Email Preview"
                        />
                      ) : (
                        <div
                          dangerouslySetInnerHTML={{ __html: generatePreviewHtml(editing) }}
                          className="w-full"
                        />
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-3 text-center">
                      {editorMode === "both" && editing.html_content.trim()
                        ? "Showing HTML preview (takes priority over variables)"
                        : "This is an approximate preview. Actual email may vary slightly."}
                    </p>
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
