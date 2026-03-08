import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Shield, Plus, Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  read_time: string;
  published: boolean;
  created_at: string;
}

const AdminBlog = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [creating, setCreating] = useState(false);

  const emptyPost: Omit<BlogPost, "id" | "created_at"> = {
    slug: "",
    title: "",
    excerpt: "",
    content: "",
    category: "General",
    read_time: "5 min read",
    published: false,
  };

  const [form, setForm] = useState(emptyPost);

  useEffect(() => {
    if (!authLoading && !adminLoading) {
      if (!user) navigate("/login");
      else if (!isAdmin) navigate("/dashboard");
    }
  }, [user, isAdmin, authLoading, adminLoading, navigate]);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });
    setPosts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchPosts();
  }, [isAdmin]);

  const handleSave = async () => {
    if (!form.title || !form.slug) {
      toast({ title: "Error", description: "Title and slug are required", variant: "destructive" });
      return;
    }

    if (editing) {
      const { error } = await supabase
        .from("blog_posts")
        .update({
          title: form.title,
          slug: form.slug,
          excerpt: form.excerpt,
          content: form.content,
          category: form.category,
          read_time: form.read_time,
          published: form.published,
        })
        .eq("id", editing.id);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Post updated" });
        setEditing(null);
        fetchPosts();
      }
    } else {
      const { error } = await supabase.from("blog_posts").insert({
        title: form.title,
        slug: form.slug,
        excerpt: form.excerpt,
        content: form.content,
        category: form.category,
        read_time: form.read_time,
        published: form.published,
        author_id: user!.id,
      });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Post created" });
        setCreating(false);
        setForm(emptyPost);
        fetchPosts();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Post deleted" });
      fetchPosts();
    }
  };

  const togglePublish = async (post: BlogPost) => {
    const { error } = await supabase
      .from("blog_posts")
      .update({ published: !post.published })
      .eq("id", post.id);
    if (!error) {
      toast({ title: post.published ? "Unpublished" : "Published" });
      fetchPosts();
    }
  };

  const startEdit = (post: BlogPost) => {
    setCreating(false);
    setEditing(post);
    setForm({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      read_time: post.read_time,
      published: post.published,
    });
  };

  const startCreate = () => {
    setEditing(null);
    setCreating(true);
    setForm(emptyPost);
  };

  if (authLoading || adminLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="font-heading text-sm text-primary animate-pulse-neon">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const showForm = creating || editing;

  return (
    <div className="cyber-grid min-h-screen py-8">
      <div className="container mx-auto px-4">
        <Link to="/admin" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-3 w-3" /> Back to Admin
        </Link>

        <div className="mt-4 flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold text-secondary neon-text-magenta flex items-center gap-2">
            <Shield className="h-6 w-6" /> Blog Management
          </h1>
          {!showForm && (
            <button
              onClick={startCreate}
              className="flex items-center gap-2 rounded bg-primary px-4 py-2 font-heading text-xs font-bold text-primary-foreground neon-glow"
            >
              <Plus className="h-3.5 w-3.5" /> New Post
            </button>
          )}
        </div>

        {showForm && (
          <div className="mt-6 rounded border border-primary/20 bg-card p-6 border-glow">
            <h2 className="font-heading text-sm font-bold text-foreground">
              {editing ? "Edit Post" : "New Post"}
            </h2>
            <div className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Title</label>
                  <input
                    value={form.title}
                    onChange={(e) => {
                      setForm({ ...form, title: e.target.value });
                      if (!editing) {
                        setForm((f) => ({
                          ...f,
                          title: e.target.value,
                          slug: e.target.value.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-"),
                        }));
                      }
                    }}
                    className="mt-1 h-10 w-full rounded border border-primary/20 bg-muted px-3 text-sm text-foreground outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Slug</label>
                  <input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="mt-1 h-10 w-full rounded border border-primary/20 bg-muted px-3 text-sm text-foreground outline-none focus:border-primary/50"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Category</label>
                  <input
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="mt-1 h-10 w-full rounded border border-primary/20 bg-muted px-3 text-sm text-foreground outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Read Time</label>
                  <input
                    value={form.read_time}
                    onChange={(e) => setForm({ ...form, read_time: e.target.value })}
                    className="mt-1 h-10 w-full rounded border border-primary/20 bg-muted px-3 text-sm text-foreground outline-none focus:border-primary/50"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.published}
                      onChange={(e) => setForm({ ...form, published: e.target.checked })}
                      className="accent-primary"
                    />
                    <span className="font-heading text-xs text-foreground">Published</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Excerpt</label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  rows={2}
                  className="mt-1 w-full rounded border border-primary/20 bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50"
                />
              </div>
              <div>
                <label className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Content (Markdown)</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={12}
                  className="mt-1 w-full rounded border border-primary/20 bg-muted px-3 py-2 font-mono text-xs text-foreground outline-none focus:border-primary/50"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="rounded bg-primary px-5 py-2 font-heading text-xs font-bold text-primary-foreground neon-glow"
                >
                  {editing ? "Update Post" : "Create Post"}
                </button>
                <button
                  onClick={() => { setEditing(null); setCreating(false); }}
                  className="rounded border border-primary/20 px-5 py-2 font-heading text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Post List */}
        <div className="mt-6 space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex flex-col gap-3 rounded border border-primary/10 bg-card p-4 sm:flex-row sm:items-center sm:justify-between border-glow"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`inline-block h-2 w-2 rounded-full ${post.published ? "bg-primary" : "bg-muted-foreground"}`} />
                  <span className="font-heading text-sm font-bold text-foreground">{post.title}</span>
                </div>
                <div className="mt-1 flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span>{post.category}</span>
                  <span>{post.read_time}</span>
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  <span className={post.published ? "text-primary" : "text-muted-foreground"}>
                    {post.published ? "Published" : "Draft"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => togglePublish(post)}
                  className="rounded p-2 text-muted-foreground hover:text-primary transition-colors"
                  title={post.published ? "Unpublish" : "Publish"}
                >
                  {post.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => startEdit(post)}
                  className="rounded p-2 text-muted-foreground hover:text-primary transition-colors"
                  title="Edit"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="rounded p-2 text-muted-foreground hover:text-destructive transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {posts.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">No blog posts yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBlog;
