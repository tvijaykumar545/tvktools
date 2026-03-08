import { Link } from "react-router-dom";

const blogPosts = [
  {
    id: "getting-started-ai-tools",
    title: "Getting Started with AI Tools for Content Creation",
    excerpt: "Learn how to leverage AI-powered tools to supercharge your content creation workflow. From blog titles to product descriptions, discover the best practices.",
    category: "AI Tutorials",
    date: "March 5, 2026",
    readTime: "5 min read",
  },
  {
    id: "seo-keyword-research-guide",
    title: "The Complete Guide to SEO Keyword Research in 2026",
    excerpt: "Master keyword research with our comprehensive guide. Learn how to find high-value keywords, analyze competition, and optimize your content strategy.",
    category: "SEO Strategies",
    date: "March 3, 2026",
    readTime: "8 min read",
  },
  {
    id: "automate-workflows-n8n",
    title: "How to Automate Your Workflows with n8n",
    excerpt: "Discover the power of n8n workflow automation and how TVK Tools uses it to process backend tools efficiently and reliably.",
    category: "Automation",
    date: "February 28, 2026",
    readTime: "6 min read",
  },
  {
    id: "json-formatting-best-practices",
    title: "JSON Formatting and Validation Best Practices",
    excerpt: "Everything developers need to know about JSON formatting, validation, and common pitfalls. Plus tips for working with large JSON files.",
    category: "Developer Guides",
    date: "February 25, 2026",
    readTime: "4 min read",
  },
  {
    id: "image-optimization-web",
    title: "Image Optimization for the Web: A Complete Guide",
    excerpt: "Learn how to optimize images for faster loading times, better SEO, and improved user experience. Covers formats, compression, and lazy loading.",
    category: "Tool Tutorials",
    date: "February 20, 2026",
    readTime: "7 min read",
  },
  {
    id: "meta-tags-seo-guide",
    title: "Meta Tags That Actually Improve Your SEO Rankings",
    excerpt: "Not all meta tags are equal. Learn which ones matter most for search engines and how to craft them effectively using our Meta Tag Generator.",
    category: "SEO Strategies",
    date: "February 15, 2026",
    readTime: "5 min read",
  },
];

const blogCategories = ["All", "AI Tutorials", "SEO Strategies", "Automation", "Developer Guides", "Tool Tutorials"];

const Blog = () => {
  return (
    <div className="cyber-grid min-h-screen py-16">
      <div className="container mx-auto px-4">
        <h1 className="font-heading text-3xl font-bold text-primary neon-text">Blog</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tutorials, guides, and insights on AI tools, SEO, automation, and development.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {blogCategories.map((cat) => (
            <button
              key={cat}
              className={`rounded px-3 py-1.5 font-heading text-[10px] font-semibold transition-all ${
                cat === "All"
                  ? "bg-primary text-primary-foreground neon-glow"
                  : "border border-primary/20 text-muted-foreground hover:text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <article
              key={post.id}
              className="group flex flex-col rounded border border-primary/10 bg-card p-6 transition-all hover:border-primary/40 border-glow"
            >
              <div className="flex items-center gap-2">
                <span className="rounded bg-primary/10 px-2 py-0.5 font-heading text-[10px] text-primary">
                  {post.category}
                </span>
                <span className="text-[10px] text-muted-foreground">{post.readTime}</span>
              </div>
              <h2 className="mt-3 font-heading text-sm font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                {post.title}
              </h2>
              <p className="mt-2 flex-1 text-xs text-muted-foreground leading-relaxed">
                {post.excerpt}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">{post.date}</span>
                <Link to={`/blog/${post.id}`} className="text-xs text-primary group-hover:underline">
                  Read more →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blog;
