import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Send, ArrowLeft, Search, User, Mail, Palette } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface UserProfile {
  user_id: string;
  display_name: string | null;
}

interface SavedTemplate {
  id: string;
  name: string;
  subject: string;
  heading: string;
  body_text: string;
  button_text: string;
  button_url: string;
  footer_text: string;
  accent_color: string;
  html_content?: string;
  editor_mode?: string;
}

const PREDEFINED_TEMPLATES = [
  { id: "custom", label: "✍️ Custom Message", subject: "", body: "" },
];

const AdminEmails = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [userEmails, setUserEmails] = useState<Record<string, string>>({});
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);

  useEffect(() => {
    if (!authLoading && !adminLoading) {
      if (!user) navigate("/login");
      else if (!isAdmin) navigate("/dashboard");
    }
  }, [user, isAdmin, authLoading, adminLoading, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchData = async () => {
      const [usersRes, templatesRes] = await Promise.all([
        supabase.from("profiles").select("user_id, display_name").order("created_at", { ascending: false }),
        supabase.from("email_templates").select("*").order("created_at", { ascending: false }),
      ]);
      setUsers(usersRes.data || []);
      setSavedTemplates((templatesRes.data as SavedTemplate[]) || []);
    };
    fetchData();
  }, [isAdmin]);

  // Fetch emails via edge function that uses service role
  const getEmail = async (userId: string): Promise<string | null> => {
    if (userEmails[userId]) return userEmails[userId];
    return null; // Will be resolved in bulk before sending
  };

  const fetchEmailsForUsers = async (userIds: string[]): Promise<Record<string, string>> => {
    // Filter out already known emails
    const unknownIds = userIds.filter((id) => !userEmails[id]);
    if (unknownIds.length === 0) return userEmails;

    try {
      const { data, error } = await supabase.functions.invoke("get-user-emails", {
        body: { user_ids: unknownIds },
      });
      if (error) throw error;
      const newEmails = data?.emails || {};
      setUserEmails((prev) => ({ ...prev, ...newEmails }));
      return { ...userEmails, ...newEmails };
    } catch {
      return userEmails;
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    // Check saved templates first
    const saved = savedTemplates.find((t) => t.id === templateId);
    if (saved) {
      setSubject(saved.subject);
      setBody(saved.body_text);
      return;
    }
    const tpl = PREDEFINED_TEMPLATES.find((t) => t.id === templateId);
    if (tpl && tpl.id !== "custom") {
      setSubject(tpl.subject);
      setBody(tpl.body);
    } else {
      setSubject("");
      setBody("");
    }
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const selectAll = () => {
    const filtered = filteredUsers.map((u) => u.user_id);
    setSelectedUsers(new Set(filtered));
  };

  const clearSelection = () => setSelectedUsers(new Set());

  const handleSend = async () => {
    if (selectedUsers.size === 0) return toast.error("Select at least one user");
    if (!subject.trim()) return toast.error("Subject is required");
    if (!body.trim()) return toast.error("Message body is required");

    setSending(true);
    let successCount = 0;
    let failCount = 0;

    // Fetch all emails in bulk first
    const allUserIds = Array.from(selectedUsers);
    const emailMap = await fetchEmailsForUsers(allUserIds);

    for (const userId of allUserIds) {
      const email = emailMap[userId];
      if (!email) {
        failCount++;
        continue;
      }

      const userProfile = users.find((u) => u.user_id === userId);
      const savedTpl = savedTemplates.find((t) => t.id === selectedTemplate);
      const useCustomHtml = savedTpl?.html_content?.trim() && (savedTpl.editor_mode === "html" || savedTpl.editor_mode === "both");
      try {
        await supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "admin-notification",
            recipientEmail: email,
            idempotencyKey: `admin-notify-${userId}-${Date.now()}`,
            templateData: {
              subject,
              heading: savedTpl?.heading || subject,
              messageBody: body,
              recipientName: userProfile?.display_name || undefined,
              buttonText: savedTpl?.button_text || undefined,
              buttonUrl: savedTpl?.button_url || undefined,
              footerText: savedTpl?.footer_text || undefined,
              accentColor: savedTpl?.accent_color || "#00ffff",
            },
            ...(useCustomHtml ? { customHtml: savedTpl!.html_content!.replace(/\{\{name\}\}/g, userProfile?.display_name || "there").replace(/\{\{subject\}\}/g, subject) } : {}),
          },
        });
        successCount++;
      } catch {
        failCount++;
      }
    }

    setSending(false);
    if (successCount > 0) toast.success(`Email sent to ${successCount} user(s)`);
    if (failCount > 0) toast.error(`Failed for ${failCount} user(s) — email address not found`);
    setSelectedUsers(new Set());
  };

  const filteredUsers = users.filter((u) =>
    (u.display_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.user_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || adminLoading) {
    return <div className="flex min-h-screen items-center justify-center"><div className="font-heading text-sm text-primary animate-pulse-neon">Loading...</div></div>;
  }

  if (!isAdmin) return null;

  return (
    <div className="cyber-grid min-h-screen py-8">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link to="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Mail className="h-6 w-6 text-secondary" />
          <h1 className="font-heading text-2xl font-bold text-secondary neon-text-magenta">Send Emails</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Send notifications to individual users</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Left: User Selection */}
          <div className="space-y-4">
            <div className="rounded border border-primary/20 bg-card p-4">
              <h2 className="font-heading text-sm font-bold text-foreground mb-3">Select Recipients</h2>
              
              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded border border-primary/20 bg-background pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                />
              </div>

              {/* Bulk actions */}
              <div className="flex gap-2 mb-3">
                <button onClick={selectAll} className="text-[10px] text-primary hover:underline">Select All ({filteredUsers.length})</button>
                <span className="text-muted-foreground text-[10px]">|</span>
                <button onClick={clearSelection} className="text-[10px] text-muted-foreground hover:underline">Clear</button>
                <span className="ml-auto text-[10px] text-primary font-bold">{selectedUsers.size} selected</span>
              </div>

              {/* User list */}
              <div className="max-h-72 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                {filteredUsers.map((u) => (
                  <label
                    key={u.user_id}
                    className={`flex items-center gap-3 rounded px-3 py-2 cursor-pointer transition-all text-xs ${
                      selectedUsers.has(u.user_id)
                        ? "bg-primary/10 border border-primary/30"
                        : "hover:bg-muted/50 border border-transparent"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(u.user_id)}
                      onChange={() => toggleUser(u.user_id)}
                      className="accent-primary"
                    />
                    <User className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="text-foreground truncate">{u.display_name || "Unnamed User"}</span>
                  </label>
                ))}
                {filteredUsers.length === 0 && (
                  <p className="text-center text-xs text-muted-foreground py-4">No users found</p>
                )}
              </div>
            </div>
          </div>

          {/* Right: Compose */}
          <div className="space-y-4">
            <div className="rounded border border-primary/20 bg-card p-4">
              <h2 className="font-heading text-sm font-bold text-foreground mb-3">Compose Email</h2>

              {/* Template picker */}
              <div className="flex items-center justify-between mb-1">
                <label className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Templates</label>
                <Link to="/admin/email-templates" className="text-[10px] text-primary hover:underline">Manage →</Link>
              </div>
              <div className="mt-1 grid grid-cols-2 gap-2 mb-4">
                {savedTemplates.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => handleTemplateSelect(tpl.id)}
                    className={`rounded border px-3 py-2 text-left text-[11px] transition-all flex items-center gap-2 ${
                      selectedTemplate === tpl.id
                        ? "border-primary/50 bg-primary/10 text-foreground"
                        : "border-primary/10 bg-background text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: tpl.accent_color }} />
                    <span className="truncate">{tpl.name}</span>
                  </button>
                ))}
                <button
                  onClick={() => handleTemplateSelect("custom")}
                  className={`rounded border px-3 py-2 text-left text-[11px] transition-all ${
                    selectedTemplate === "custom"
                      ? "border-primary/50 bg-primary/10 text-foreground"
                      : "border-primary/10 bg-background text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  ✍️ Custom Message
                </button>
              </div>

              {/* Subject */}
              <label className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject..."
                className="mt-1 mb-3 h-10 w-full rounded border border-primary/20 bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50"
              />

              {/* Body */}
              <label className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Message</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={8}
                placeholder="Write your message..."
                className="mt-1 w-full rounded border border-primary/20 bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 resize-none"
              />

              {/* Send */}
              <button
                onClick={handleSend}
                disabled={sending || selectedUsers.size === 0 || !subject.trim() || !body.trim()}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded bg-secondary py-3 font-heading text-xs font-bold text-secondary-foreground neon-glow-magenta disabled:opacity-50 transition-all"
              >
                <Send className="h-4 w-4" />
                {sending ? "Sending..." : `Send to ${selectedUsers.size} User(s)`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEmails;
