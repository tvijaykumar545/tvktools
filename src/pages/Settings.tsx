import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { User, Camera, Save, ArrowLeft, Shield, Mail, Bell, Globe, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import { categories } from "@/data/tools";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "ja", label: "Japanese" },
  { code: "zh", label: "Chinese" },
  { code: "pt", label: "Portuguese" },
  { code: "ar", label: "Arabic" },
  { code: "ko", label: "Korean" },
];

const Settings = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Preferences
  const [defaultCategory, setDefaultCategory] = useState("all");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [language, setLanguage] = useState("en");
  const [prefsLoading, setPrefsLoading] = useState(false);
  const [prefsSaving, setPrefsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile]);

  // Load preferences from DB
  useEffect(() => {
    if (user) {
      const loadPrefs = async () => {
        setPrefsLoading(true);
        try {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", user.id)
            .single();

          if (data) {
            const d = data as any;
            setDefaultCategory(d.default_category || "all");
            setNotificationsEnabled(d.notifications_enabled ?? true);
            setEmailNotifications(d.email_notifications ?? true);
            setLanguage(d.language || "en");
          }
        } catch (error) {
          console.error("Error loading preferences:", error);
        }
        setPrefsLoading(false);
      };
      loadPrefs();
    }
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image file.", variant: "destructive" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max file size is 2MB.", variant: "destructive" });
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const url = `${publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: url })
      .eq("user_id", user.id);

    if (updateError) {
      toast({ title: "Error", description: updateError.message, variant: "destructive" });
    } else {
      setAvatarUrl(url);
      toast({ title: "Avatar updated", description: "Your profile picture has been changed." });
    }
    setUploading(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName })
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile saved", description: "Your display name has been updated." });
    }
    setSaving(false);
  };

  const handleSavePreferences = async () => {
    if (!user) return;
    setPrefsSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        default_category: defaultCategory,
        notifications_enabled: notificationsEnabled,
        email_notifications: emailNotifications,
        language,
      } as any)
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Preferences saved", description: "Your preferences have been updated." });
    }
    setPrefsSaving(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }

    setPasswordLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated", description: "Your password has been changed successfully." });
      setNewPassword("");
      setConfirmPassword("");
    }
    setPasswordLoading(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="font-heading text-sm text-primary animate-pulse-neon">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="cyber-grid min-h-screen py-8">
      <div className="container mx-auto max-w-2xl px-4">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3 w-3" /> Back to Dashboard
        </Link>

        <h1 className="mt-4 font-heading text-2xl font-bold text-primary neon-text">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your profile and account preferences</p>

        {/* Avatar & Display Name */}
        <div className="mt-8 rounded border border-primary/20 bg-card p-6 border-glow">
          <h2 className="font-heading text-sm font-bold text-foreground flex items-center gap-2">
            <User className="h-4 w-4 text-primary" /> Profile
          </h2>

          <div className="mt-5 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <div className="relative group">
              <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-primary/30 bg-muted flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Camera className="h-5 w-5 text-primary" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/80">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              )}
            </div>

            <div className="flex-1 w-full space-y-4">
              <div>
                <label className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  className="mt-1 h-10 w-full rounded border border-primary/20 bg-muted px-3 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary/50"
                />
              </div>
              <div>
                <label className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Email
                </label>
                <div className="mt-1 flex h-10 items-center gap-2 rounded border border-primary/10 bg-muted/50 px-3 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  {user.email}
                </div>
              </div>
              <div>
                <label className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Plan
                </label>
                <div className="mt-1 flex h-10 items-center rounded border border-primary/10 bg-muted/50 px-3">
                  <span className="rounded bg-primary/10 px-2 py-0.5 font-heading text-[10px] font-bold uppercase text-primary">
                    {profile?.plan || "free"}
                  </span>
                  <Link to="/pricing" className="ml-auto text-[10px] text-primary hover:underline">
                    Upgrade
                  </Link>
                </div>
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex items-center gap-2 rounded bg-primary px-5 py-2.5 font-heading text-xs font-bold text-primary-foreground neon-glow disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="mt-6 rounded border border-primary/20 bg-card p-6 border-glow">
          <h2 className="font-heading text-sm font-bold text-foreground flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" /> Preferences
          </h2>

          {prefsLoading ? (
            <div className="mt-4 text-xs text-muted-foreground animate-pulse">Loading preferences...</div>
          ) : (
            <div className="mt-5 space-y-5">
              {/* Theme */}
              <div>
                <label className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Theme
                </label>
                <div className="mt-1 flex gap-2">
                  <button
                    onClick={() => { if (theme === "light") toggleTheme(); }}
                    className={`flex-1 rounded border px-4 py-2.5 font-heading text-xs font-semibold transition-all ${
                      theme === "dark"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-primary/20 text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    🌙 Dark
                  </button>
                  <button
                    onClick={() => { if (theme === "dark") toggleTheme(); }}
                    className={`flex-1 rounded border px-4 py-2.5 font-heading text-xs font-semibold transition-all ${
                      theme === "light"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-primary/20 text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    ☀️ Light
                  </button>
                </div>
              </div>

              {/* Default Category */}
              <div>
                <label className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Default Tool Category
                </label>
                <select
                  value={defaultCategory}
                  onChange={(e) => setDefaultCategory(e.target.value)}
                  className="mt-1 h-10 w-full rounded border border-primary/20 bg-muted px-3 text-sm text-foreground outline-none focus:border-primary/50 appearance-none cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Language */}
              <div>
                <label className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Globe className="h-3 w-3" /> Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="mt-1 h-10 w-full rounded border border-primary/20 bg-muted px-3 text-sm text-foreground outline-none focus:border-primary/50 appearance-none cursor-pointer"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notification Settings */}
              <div>
                <label className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Bell className="h-3 w-3" /> Notifications
                </label>
                <div className="mt-2 space-y-3">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-sm text-foreground">Push Notifications</span>
                    <button
                      onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        notificationsEnabled ? "bg-primary" : "bg-muted-foreground/30"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-background transition-transform shadow-sm ${
                          notificationsEnabled ? "translate-x-5" : ""
                        }`}
                      />
                    </button>
                  </label>
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-sm text-foreground">Email Notifications</span>
                    <button
                      onClick={() => setEmailNotifications(!emailNotifications)}
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        emailNotifications ? "bg-primary" : "bg-muted-foreground/30"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-background transition-transform shadow-sm ${
                          emailNotifications ? "translate-x-5" : ""
                        }`}
                      />
                    </button>
                  </label>
                </div>
              </div>

              <button
                onClick={handleSavePreferences}
                disabled={prefsSaving}
                className="flex items-center gap-2 rounded bg-primary px-5 py-2.5 font-heading text-xs font-bold text-primary-foreground neon-glow disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                {prefsSaving ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          )}
        </div>

        {/* Change Password */}
        <div className="mt-6 rounded border border-primary/20 bg-card p-6 border-glow">
          <h2 className="font-heading text-sm font-bold text-foreground flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" /> Change Password
          </h2>
          <form onSubmit={handleChangePassword} className="mt-5 space-y-4">
            <div>
              <label className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Min. 6 characters"
                className="mt-1 h-10 w-full rounded border border-primary/20 bg-muted px-3 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary/50"
              />
            </div>
            <div>
              <label className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="mt-1 h-10 w-full rounded border border-primary/20 bg-muted px-3 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary/50"
              />
            </div>
            <button
              type="submit"
              disabled={passwordLoading}
              className="rounded bg-primary px-5 py-2.5 font-heading text-xs font-bold text-primary-foreground neon-glow disabled:opacity-50"
            >
              {passwordLoading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="mt-6 mb-8 rounded border border-destructive/20 bg-card p-6">
          <h2 className="font-heading text-sm font-bold text-destructive flex items-center gap-2">
            <Shield className="h-4 w-4" /> Danger Zone
          </h2>
          <p className="mt-2 text-xs text-muted-foreground">
            To delete your account or export your data, please contact support.
          </p>
          <Link
            to="/contact"
            className="mt-3 inline-block rounded border border-destructive/30 px-4 py-2 font-heading text-xs text-destructive hover:bg-destructive/10 transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Settings;
