import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Shield, Star, Zap, Sparkles, Plus, Pencil, Trash2, Eye, EyeOff, X, Download, Upload, FileJson } from "lucide-react";
import type { ToolCategory } from "@/data/tools";
import { useToast } from "@/hooks/use-toast";
import {
  useAdminManagedTools,
  useCreateTool,
  useUpdateTool,
  useDeleteTool,
  type ManagedTool,
} from "@/hooks/useManagedTools";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ToolFormData = {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  is_free: boolean;
  is_popular: boolean;
  is_new: boolean;
  type: string;
  sort_order: number;
  is_active: boolean;
  points_cost: number;
};

const emptyForm: ToolFormData = {
  id: "",
  name: "",
  description: "",
  category: "utility",
  icon: "🔧",
  is_free: true,
  is_popular: false,
  is_new: false,
  type: "frontend",
  sort_order: 100,
  is_active: true,
  points_cost: 0,
};

const AdminTools = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [filter, setFilter] = useState<ToolCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<ManagedTool | null>(null);
  const [deletingTool, setDeletingTool] = useState<ManagedTool | null>(null);
  const [form, setForm] = useState<ToolFormData>(emptyForm);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importData, setImportData] = useState<string>("");
  const [importPreview, setImportPreview] = useState<ToolFormData[]>([]);
  const [importError, setImportError] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: toolList = [], isLoading } = useAdminManagedTools();
  const createTool = useCreateTool();
  const updateTool = useUpdateTool();
  const deleteTool = useDeleteTool();

  useEffect(() => {
    if (!authLoading && !adminLoading) {
      if (!user) navigate("/login");
      else if (!isAdmin) navigate("/dashboard");
    }
  }, [user, isAdmin, authLoading, adminLoading, navigate]);

  const filtered = toolList.filter((t) => {
    if (filter !== "all" && t.category !== filter) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const openAddDialog = () => {
    setEditingTool(null);
    setForm({ ...emptyForm, sort_order: toolList.length + 1 });
    setDialogOpen(true);
  };

  const openEditDialog = (tool: ManagedTool) => {
    setEditingTool(tool);
    setForm({
      id: tool.id,
      name: tool.name,
      description: tool.description,
      category: tool.category,
      icon: tool.icon,
      is_free: tool.is_free,
      is_popular: tool.is_popular,
      is_new: tool.is_new,
      type: tool.type,
      sort_order: tool.sort_order,
      is_active: tool.is_active,
      points_cost: tool.points_cost ?? 0,
    });
    setDialogOpen(true);
  };

  const openDeleteDialog = (tool: ManagedTool) => {
    setDeletingTool(tool);
    setDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.id.trim() || !form.name.trim()) {
      toast({ title: "Error", description: "ID and Name are required", variant: "destructive" });
      return;
    }
    try {
      if (editingTool) {
        await updateTool.mutateAsync({
          id: form.id,
          name: form.name,
          description: form.description,
          category: form.category,
          icon: form.icon,
          is_free: form.is_free,
          is_popular: form.is_popular,
          is_new: form.is_new,
          type: form.type,
          sort_order: form.sort_order,
          is_active: form.is_active,
          points_cost: form.points_cost,
        });
        toast({ title: "Tool updated!" });
      } else {
        await createTool.mutateAsync({
          id: form.id,
          name: form.name,
          description: form.description,
          category: form.category,
          icon: form.icon,
          is_free: form.is_free,
          is_popular: form.is_popular,
          is_new: form.is_new,
          type: form.type,
          sort_order: form.sort_order,
          is_active: form.is_active,
          points_cost: form.points_cost,
        });
        toast({ title: "Tool created!" });
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deletingTool) return;
    try {
      await deleteTool.mutateAsync(deletingTool.id);
      toast({ title: "Tool deleted" });
      setDeleteDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const toggleActive = async (tool: ManagedTool) => {
    try {
      await updateTool.mutateAsync({ id: tool.id, is_active: !tool.is_active });
      toast({ title: tool.is_active ? "Tool deactivated" : "Tool activated" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const toggleProp = async (tool: ManagedTool, prop: "is_free" | "is_popular" | "is_new") => {
    try {
      await updateTool.mutateAsync({ id: tool.id, [prop]: !tool[prop] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // ---- Bulk Export ----
  const handleExport = () => {
    const exportData = toolList.map(({ created_at, updated_at, ...rest }) => rest);
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tools-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: `Exported ${exportData.length} tools` });
  };

  // ---- Bulk Import ----
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setImportData(text);
      parseImportData(text);
      setImportDialogOpen(true);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const parseImportData = (text: string) => {
    try {
      const parsed = JSON.parse(text);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      const tools: ToolFormData[] = arr.map((t: any, i: number) => ({
        id: t.id || "",
        name: t.name || "",
        description: t.description || "",
        category: t.category || "utility",
        icon: t.icon || "🔧",
        is_free: t.is_free ?? true,
        is_popular: t.is_popular ?? false,
        is_new: t.is_new ?? false,
        type: t.type || "frontend",
        sort_order: t.sort_order ?? (toolList.length + i + 1),
        is_active: t.is_active ?? true,
        points_cost: t.points_cost ?? 0,
      }));
      const invalid = tools.filter((t) => !t.id || !t.name);
      if (invalid.length > 0) {
        setImportError(`${invalid.length} tool(s) missing required id or name`);
        setImportPreview(tools.filter((t) => t.id && t.name));
      } else {
        setImportError("");
        setImportPreview(tools);
      }
    } catch {
      setImportError("Invalid JSON format");
      setImportPreview([]);
    }
  };

  const handleImport = async () => {
    if (importPreview.length === 0) return;
    setIsImporting(true);
    let success = 0;
    let updated = 0;
    let failed = 0;
    const existingIds = new Set(toolList.map((t) => t.id));

    for (const tool of importPreview) {
      try {
        if (existingIds.has(tool.id)) {
          await updateTool.mutateAsync({ id: tool.id, ...tool });
          updated++;
        } else {
          await createTool.mutateAsync(tool);
          success++;
        }
      } catch {
        failed++;
      }
    }
    setIsImporting(false);
    setImportDialogOpen(false);
    setImportPreview([]);
    setImportData("");
    toast({
      title: "Import complete",
      description: `${success} created, ${updated} updated${failed ? `, ${failed} failed` : ""}`,
    });
  };

  if (authLoading || adminLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="font-heading text-sm text-primary animate-pulse-neon">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const categories: { value: ToolCategory | "all"; label: string }[] = [
    { value: "all", label: "All" },
    { value: "ai", label: "AI" },
    { value: "seo", label: "SEO" },
    { value: "developer", label: "Developer" },
    { value: "image", label: "Image" },
    { value: "utility", label: "Utility" },
    { value: "pdf", label: "PDF" },
  ];

  return (
    <div className="cyber-grid min-h-screen py-8">
      <div className="container mx-auto px-4">
        <Link to="/admin" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-3 w-3" /> Back to Admin
        </Link>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-secondary neon-text-magenta flex items-center gap-2">
              <Shield className="h-6 w-6" /> Tool Management
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{toolList.length} tools configured</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 rounded border border-primary/20 px-3 py-2 font-heading text-xs font-semibold text-muted-foreground transition-all hover:text-primary hover:border-primary/40"
            >
              <Download className="h-4 w-4" /> Export
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 rounded border border-primary/20 px-3 py-2 font-heading text-xs font-semibold text-muted-foreground transition-all hover:text-primary hover:border-primary/40"
            >
              <Upload className="h-4 w-4" /> Import
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={openAddDialog}
              className="flex items-center gap-2 rounded bg-primary px-4 py-2 font-heading text-xs font-bold text-primary-foreground transition-all hover:bg-primary/90 neon-glow"
            >
              <Plus className="h-4 w-4" /> Add Tool
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tools..."
            className="h-9 rounded border border-primary/20 bg-muted px-3 text-sm text-foreground outline-none focus:border-primary/50 sm:w-64"
          />
          <div className="flex flex-wrap gap-1">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setFilter(cat.value)}
                className={`rounded px-3 py-1.5 font-heading text-[10px] font-semibold transition-all ${
                  filter === cat.value
                    ? "bg-primary text-primary-foreground"
                    : "border border-primary/20 text-muted-foreground hover:text-primary"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-2">
          {filtered.map((tool) => (
            <div
              key={tool.id}
              className={`flex flex-col gap-2 rounded border bg-card p-3 sm:flex-row sm:items-center sm:justify-between border-glow ${
                tool.is_active ? "border-primary/10" : "border-destructive/20 opacity-60"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{tool.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-xs font-bold text-foreground">{tool.name}</span>
                    <span className="rounded bg-muted px-1.5 py-0.5 font-heading text-[9px] uppercase text-muted-foreground">
                      {tool.type}
                    </span>
                    <span className="rounded bg-muted px-1.5 py-0.5 font-heading text-[9px] uppercase text-muted-foreground">
                      {tool.category}
                    </span>
                    <span className="rounded bg-accent/20 px-1.5 py-0.5 font-heading text-[9px] text-accent-foreground">
                      {(tool as any).points_cost || 0} pts
                    </span>
                    {!tool.is_active && (
                      <span className="rounded bg-destructive/20 px-1.5 py-0.5 font-heading text-[9px] uppercase text-destructive">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground">{tool.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggleProp(tool, "is_free")}
                  className={`flex items-center gap-1 rounded px-2 py-1 font-heading text-[10px] font-bold transition-all ${
                    tool.is_free ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"
                  }`}
                  title={tool.is_free ? "Free" : "Pro"}
                >
                  <Zap className="h-3 w-3" />
                  {tool.is_free ? "Free" : "Pro"}
                </button>
                <button
                  onClick={() => toggleProp(tool, "is_popular")}
                  className={`flex items-center gap-1 rounded px-2 py-1 font-heading text-[10px] font-bold transition-all ${
                    tool.is_popular ? "bg-accent/20 text-accent-foreground" : "bg-muted text-muted-foreground"
                  }`}
                  title="Popular"
                >
                  <Star className="h-3 w-3" />
                </button>
                <button
                  onClick={() => toggleProp(tool, "is_new")}
                  className={`flex items-center gap-1 rounded px-2 py-1 font-heading text-[10px] font-bold transition-all ${
                    tool.is_new ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  }`}
                  title="New"
                >
                  <Sparkles className="h-3 w-3" />
                </button>
                <button
                  onClick={() => toggleActive(tool)}
                  className={`rounded px-2 py-1 text-[10px] transition-all ${
                    tool.is_active ? "text-muted-foreground hover:text-accent" : "text-destructive hover:text-primary"
                  }`}
                  title={tool.is_active ? "Deactivate" : "Activate"}
                >
                  {tool.is_active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                </button>
                <button
                  onClick={() => openEditDialog(tool)}
                  className="rounded px-2 py-1 text-[10px] text-muted-foreground hover:text-primary"
                  title="Edit"
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  onClick={() => openDeleteDialog(tool)}
                  className="rounded px-2 py-1 text-[10px] text-muted-foreground hover:text-destructive"
                  title="Delete"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
                <Link
                  to={`/tool/${tool.id}`}
                  className="rounded px-2 py-1 text-[10px] text-muted-foreground hover:text-primary"
                >
                  View →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg border-primary/20 bg-card">
          <DialogHeader>
            <DialogTitle className="font-heading text-primary">
              {editingTool ? "Edit Tool" : "Add New Tool"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-heading text-[10px] uppercase text-muted-foreground">Tool ID (slug)</label>
                <input
                  value={form.id}
                  onChange={(e) => setForm({ ...form, id: e.target.value })}
                  disabled={!!editingTool}
                  placeholder="my-tool-id"
                  className="mt-1 h-9 w-full rounded border border-primary/20 bg-muted px-3 text-sm text-foreground outline-none focus:border-primary/50 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="font-heading text-[10px] uppercase text-muted-foreground">Icon (emoji)</label>
                <input
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  className="mt-1 h-9 w-full rounded border border-primary/20 bg-muted px-3 text-sm text-foreground outline-none focus:border-primary/50"
                />
              </div>
            </div>
            <div>
              <label className="font-heading text-[10px] uppercase text-muted-foreground">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Tool Name"
                className="mt-1 h-9 w-full rounded border border-primary/20 bg-muted px-3 text-sm text-foreground outline-none focus:border-primary/50"
              />
            </div>
            <div>
              <label className="font-heading text-[10px] uppercase text-muted-foreground">Description</label>
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Short description"
                className="mt-1 h-9 w-full rounded border border-primary/20 bg-muted px-3 text-sm text-foreground outline-none focus:border-primary/50"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-heading text-[10px] uppercase text-muted-foreground">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="mt-1 h-9 w-full rounded border border-primary/20 bg-muted px-2 text-sm text-foreground outline-none"
                >
                  <option value="ai">AI</option>
                  <option value="seo">SEO</option>
                  <option value="developer">Developer</option>
                  <option value="image">Image</option>
                  <option value="utility">Utility</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>
              <div>
                <label className="font-heading text-[10px] uppercase text-muted-foreground">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="mt-1 h-9 w-full rounded border border-primary/20 bg-muted px-2 text-sm text-foreground outline-none"
                >
                  <option value="frontend">Frontend</option>
                  <option value="backend">Backend</option>
                </select>
              </div>
              <div>
                <label className="font-heading text-[10px] uppercase text-muted-foreground">Sort Order</label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                  className="mt-1 h-9 w-full rounded border border-primary/20 bg-muted px-3 text-sm text-foreground outline-none focus:border-primary/50"
                />
              </div>
            </div>
            <div>
              <label className="font-heading text-[10px] uppercase text-muted-foreground">Points Cost</label>
              <input
                type="number"
                min={0}
                value={form.points_cost}
                onChange={(e) => setForm({ ...form, points_cost: parseInt(e.target.value) || 0 })}
                placeholder="0 = free"
                className="mt-1 h-9 w-full rounded border border-primary/20 bg-muted px-3 text-sm text-foreground outline-none focus:border-primary/50"
              />
            </div>
            <div className="flex flex-wrap gap-4">
              {([
                { key: "is_free", label: "Free" },
                { key: "is_popular", label: "Popular" },
                { key: "is_new", label: "New" },
                { key: "is_active", label: "Active" },
              ] as const).map((item) => (
                <label key={item.key} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form[item.key]}
                    onChange={(e) => setForm({ ...form, [item.key]: e.target.checked })}
                    className="accent-primary"
                  />
                  {item.label}
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDialogOpen(false)}
                className="rounded border border-primary/20 px-4 py-2 font-heading text-xs text-muted-foreground hover:text-primary"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={createTool.isPending || updateTool.isPending}
                className="rounded bg-primary px-4 py-2 font-heading text-xs font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {createTool.isPending || updateTool.isPending ? "Saving..." : editingTool ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm border-destructive/20 bg-card">
          <DialogHeader>
            <DialogTitle className="font-heading text-destructive">Delete Tool</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to permanently delete <strong className="text-foreground">{deletingTool?.name}</strong>? This cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setDeleteDialogOpen(false)}
              className="rounded border border-primary/20 px-4 py-2 font-heading text-xs text-muted-foreground hover:text-primary"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteTool.isPending}
              className="rounded bg-destructive px-4 py-2 font-heading text-xs font-bold text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
            >
              {deleteTool.isPending ? "Deleting..." : "Delete"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="max-w-2xl border-primary/20 bg-card">
          <DialogHeader>
            <DialogTitle className="font-heading text-primary flex items-center gap-2">
              <FileJson className="h-5 w-5" /> Import Tools from JSON
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {importError && (
              <div className="rounded border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {importError}
              </div>
            )}

            {importPreview.length > 0 && (
              <>
                <p className="text-sm text-muted-foreground">
                  <span className="font-heading font-bold text-foreground">{importPreview.length}</span> tool(s) ready to import.
                  Existing tools will be updated, new ones will be created.
                </p>
                <div className="max-h-64 overflow-y-auto rounded border border-primary/10 bg-muted/50">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-primary/10 text-left font-heading uppercase text-muted-foreground">
                        <th className="px-3 py-2">ID</th>
                        <th className="px-3 py-2">Name</th>
                        <th className="px-3 py-2">Category</th>
                        <th className="px-3 py-2">Type</th>
                        <th className="px-3 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importPreview.map((t) => {
                        const exists = toolList.some((e) => e.id === t.id);
                        return (
                          <tr key={t.id} className="border-b border-primary/5">
                            <td className="px-3 py-1.5 font-mono text-foreground">{t.id}</td>
                            <td className="px-3 py-1.5 text-foreground">{t.name}</td>
                            <td className="px-3 py-1.5 text-muted-foreground">{t.category}</td>
                            <td className="px-3 py-1.5 text-muted-foreground">{t.type}</td>
                            <td className="px-3 py-1.5">
                              <span className={`rounded px-1.5 py-0.5 font-heading text-[9px] uppercase ${
                                exists ? "bg-accent/20 text-accent-foreground" : "bg-primary/20 text-primary"
                              }`}>
                                {exists ? "Update" : "New"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {importPreview.length === 0 && !importError && (
              <p className="text-sm text-muted-foreground">
                Select a JSON file to preview tools for import. Use the exported format as reference.
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => { setImportDialogOpen(false); setImportPreview([]); setImportData(""); setImportError(""); }}
                className="rounded border border-primary/20 px-4 py-2 font-heading text-xs text-muted-foreground hover:text-primary"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={importPreview.length === 0 || isImporting}
                className="rounded bg-primary px-4 py-2 font-heading text-xs font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {isImporting ? "Importing..." : `Import ${importPreview.length} Tool(s)`}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTools;
