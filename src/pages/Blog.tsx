import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  read_time: string;
  created_at: string;
}

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("id, slug, title, excerpt, category, read_time, created_at")
        .eq("published", true)
        .order("created_at", { ascending: false });
      setPosts(data || []);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  const categories = ["All", ...Array.from(new Set(posts.map((p) => p.category)))];
  const filtered = activeCategory === "All" ? posts : posts.filter((p) => p.category === activeCategory);

  return (
    <div className="cyber-grid min-h-screen py-16">
      <div className="container mx-auto px-4">
        <h1 className="font-heading text-3xl font-bold text-primary neon-text">Blog</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tutorials, guides, and insights on AI tools, SEO, automation, and development.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded px-3 py-1.5 font-heading text-[10px] font-semibold transition-all ${
                cat === activeCategory
                  ? "bg-primary text-primary-foreground neon-glow"
                  : "border border-primary/20 text-muted-foreground hover:text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="mt-16 text-center font-heading text-sm text-primary animate-pulse-neon">Loading posts...</div>
        ) : filtered.length === 0 ? (
          <div className="mt-16 text-center text-sm text-muted-foreground">No posts found.</div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post) => (
              <article
                key={post.id}
                className="group flex flex-col rounded border border-primary/10 bg-card p-6 transition-all hover:border-primary/40 border-glow"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded bg-primary/10 px-2 py-0.5 font-heading text-[10px] text-primary">
                    {post.category}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{post.read_time}</span>
                </div>
                <h2 className="mt-3 font-heading text-sm font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                <p className="mt-2 flex-1 text-xs text-muted-foreground leading-relaxed">
                  {post.excerpt}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </span>
                  <Link to={`/blog/${post.slug}`} className="text-xs text-primary group-hover:underline">
                    Read more →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
