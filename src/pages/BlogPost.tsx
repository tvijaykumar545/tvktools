import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Clock, Calendar, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

interface Post {
  title: string;
  content: string;
  category: string;
  read_time: string;
  created_at: string;
}

const BlogPost = () => {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("title, content, category, read_time, created_at")
        .eq("slug", id)
        .eq("published", true)
        .maybeSingle();
      setPost(data);
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="font-heading text-sm text-primary animate-pulse-neon">Loading...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="font-heading text-xl text-foreground">Post Not Found</h1>
        <Link to="/blog" className="text-sm text-primary hover:underline">← Back to Blog</Link>
      </div>
    );
  }

  return (
    <div className="cyber-grid min-h-screen py-16">
      <div className="container mx-auto max-w-3xl px-4">
        <Link to="/blog" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-3 w-3" /> Back to Blog
        </Link>

        <article className="mt-6">
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Tag className="h-3 w-3" /> {post.category}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {post.read_time}</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(post.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>

          <h1 className="mt-4 font-heading text-2xl font-bold text-primary neon-text leading-tight sm:text-3xl">
            {post.title}
          </h1>

          <div className="mt-8 prose prose-invert prose-sm max-w-none prose-headings:font-heading prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-primary prose-li:text-muted-foreground">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </article>

        <div className="mt-12 border-t border-primary/10 pt-6">
          <Link to="/blog" className="text-xs text-primary hover:underline">← Back to all posts</Link>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
