import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Tag, Share2, Twitter, Linkedin, Link as LinkIcon, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface BlogPostData {
  id: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  sections: { id: string; title: string; content: string }[];
}

const blogPostsData: Record<string, BlogPostData> = {
  "getting-started-ai-tools": {
    id: "getting-started-ai-tools",
    title: "Getting Started with AI Tools for Content Creation",
    category: "AI Tutorials",
    date: "March 5, 2026",
    readTime: "5 min read",
    sections: [
      {
        id: "introduction",
        title: "Introduction",
        content:
          "Artificial intelligence has transformed the way we create content. From generating blog titles to crafting product descriptions, AI-powered tools can dramatically accelerate your workflow while maintaining quality. In this guide, we'll walk you through the essential AI tools available on TVK Tools and how to get the most out of them.",
      },
      {
        id: "why-ai-tools",
        title: "Why Use AI Tools?",
        content:
          "AI tools remove creative bottlenecks by offering instant suggestions, variations, and drafts. Whether you're a solo creator or part of a marketing team, these tools help you:\n\n• Generate ideas faster than brainstorming sessions\n• Maintain consistent tone and style across content\n• Scale content production without hiring additional writers\n• Overcome writer's block with smart prompts\n• A/B test headlines and descriptions effortlessly",
      },
      {
        id: "available-tools",
        title: "Available AI Tools on TVK Tools",
        content:
          "TVK Tools offers a suite of AI-powered utilities designed for content creators:\n\n**Blog Title Generator** — Input your topic and get 10+ SEO-optimized title suggestions ranked by engagement potential.\n\n**Product Description Writer** — Paste your product details and receive compelling, conversion-focused copy.\n\n**Meta Tag Generator** — Automatically generate title tags and meta descriptions optimized for search engines.\n\n**Content Summarizer** — Paste long-form content and get concise summaries suitable for social media or newsletters.",
      },
      {
        id: "best-practices",
        title: "Best Practices",
        content:
          "To get the best results from AI tools, keep these principles in mind:\n\n1. **Provide clear inputs** — The more specific your prompt, the better the output. Include target audience, tone, and key points.\n2. **Iterate and refine** — Use AI output as a starting point, then edit for your brand voice.\n3. **Combine tools** — Use the title generator first, then feed the chosen title into the description writer for cohesive content.\n4. **Check for accuracy** — Always verify facts, statistics, and claims in AI-generated content.\n5. **Track performance** — Use the dashboard to monitor which AI-generated content performs best.",
      },
      {
        id: "conclusion",
        title: "Conclusion",
        content:
          "AI tools are not a replacement for human creativity — they're an amplifier. By integrating TVK Tools' AI suite into your workflow, you can produce more content, faster, without sacrificing quality. Start with the Blog Title Generator and explore from there.",
      },
    ],
  },
  "seo-keyword-research-guide": {
    id: "seo-keyword-research-guide",
    title: "The Complete Guide to SEO Keyword Research in 2026",
    category: "SEO Strategies",
    date: "March 3, 2026",
    readTime: "8 min read",
    sections: [
      {
        id: "introduction",
        title: "Introduction",
        content:
          "Keyword research remains the foundation of any successful SEO strategy. In 2026, with evolving search algorithms and AI-powered search experiences, understanding how users search for information is more critical than ever. This guide covers modern keyword research techniques and how to apply them effectively.",
      },
      {
        id: "keyword-types",
        title: "Types of Keywords",
        content:
          "Understanding keyword types helps you build a balanced content strategy:\n\n**Short-tail keywords** (1-2 words) — High volume, high competition. Example: \"SEO tools\"\n\n**Long-tail keywords** (3+ words) — Lower volume, higher intent. Example: \"best free SEO keyword research tools 2026\"\n\n**LSI keywords** — Semantically related terms that help search engines understand context. Example: for \"keyword research,\" LSI terms include \"search volume,\" \"competition analysis,\" \"SERP.\"\n\n**Question keywords** — Queries phrased as questions, ideal for featured snippets. Example: \"How do I find low-competition keywords?\"",
      },
      {
        id: "research-process",
        title: "The Research Process",
        content:
          "Follow this systematic approach to keyword research:\n\n1. **Seed keywords** — Start with broad terms related to your niche.\n2. **Expand** — Use tools to find related terms, questions, and long-tail variations.\n3. **Analyze metrics** — Look at search volume, keyword difficulty, and click-through rates.\n4. **Assess intent** — Categorize keywords by intent: informational, navigational, commercial, or transactional.\n5. **Prioritize** — Focus on keywords with reasonable volume, low-to-medium difficulty, and strong intent alignment.\n6. **Map to content** — Assign keywords to specific pages or articles in your content plan.",
      },
      {
        id: "tools-and-techniques",
        title: "Tools and Techniques",
        content:
          "TVK Tools provides several utilities that support keyword research:\n\n• **Keyword Density Checker** — Analyze existing content to ensure optimal keyword usage without over-optimization.\n• **Meta Tag Generator** — Create search-optimized meta tags using your target keywords.\n• **Word Counter** — Ensure your content meets recommended length benchmarks for target keywords.\n\nCombine these with external tools like Google Search Console data to build a comprehensive keyword strategy.",
      },
      {
        id: "common-mistakes",
        title: "Common Mistakes to Avoid",
        content:
          "Watch out for these keyword research pitfalls:\n\n• **Keyword stuffing** — Overusing keywords damages readability and rankings.\n• **Ignoring intent** — Ranking for the wrong intent leads to high bounce rates.\n• **Chasing volume only** — High-volume keywords are often too competitive for newer sites.\n• **Neglecting updates** — Search trends change. Revisit your keyword strategy quarterly.\n• **Forgetting local SEO** — If you serve a specific region, include location-based keywords.",
      },
      {
        id: "conclusion",
        title: "Conclusion",
        content:
          "Effective keyword research is an ongoing process, not a one-time task. By systematically identifying, analyzing, and mapping keywords to content, you build a sustainable organic traffic engine. Use TVK Tools to streamline the technical aspects so you can focus on creating valuable content.",
      },
    ],
  },
  "automate-workflows-n8n": {
    id: "automate-workflows-n8n",
    title: "How to Automate Your Workflows with n8n",
    category: "Automation",
    date: "February 28, 2026",
    readTime: "6 min read",
    sections: [
      {
        id: "introduction",
        title: "Introduction",
        content:
          "Workflow automation is a game-changer for productivity. n8n is an open-source automation platform that connects apps, services, and APIs without writing complex code. TVK Tools uses n8n extensively to power backend tool processing, and in this article, we share how you can leverage similar automation patterns.",
      },
      {
        id: "what-is-n8n",
        title: "What is n8n?",
        content:
          "n8n (pronounced \"nodemation\") is a workflow automation tool that lets you connect different services and build automated processes visually. Key features include:\n\n• **Visual workflow builder** — Drag-and-drop interface for creating automation flows.\n• **200+ integrations** — Connect to popular services like Slack, Google Sheets, databases, and APIs.\n• **Self-hostable** — Run on your own infrastructure for full control over data.\n• **Custom code nodes** — Write JavaScript or Python when you need custom logic.\n• **Error handling** — Built-in retry mechanisms and error workflows.",
      },
      {
        id: "use-cases",
        title: "Practical Use Cases",
        content:
          "Here are automation workflows relevant to content creators and developers:\n\n**Content pipeline** — Automatically format, validate, and publish content when a new draft is submitted.\n\n**SEO monitoring** — Schedule regular checks of your site's meta tags and keyword rankings, then send alerts for issues.\n\n**Data processing** — Transform CSV or JSON data between formats and load it into your database.\n\n**Social sharing** — Automatically post new blog articles to Twitter, LinkedIn, and other platforms.\n\n**Backup automation** — Schedule regular exports of your tool usage data and analytics.",
      },
      {
        id: "getting-started",
        title: "Getting Started with n8n",
        content:
          "To set up your first n8n workflow:\n\n1. **Install n8n** — Use Docker, npm, or the cloud-hosted version.\n2. **Create a workflow** — Open the editor and add your first trigger node (e.g., webhook, schedule, or manual).\n3. **Add processing nodes** — Connect nodes that transform, filter, or route your data.\n4. **Test thoroughly** — Use n8n's execution preview to verify each step before activating.\n5. **Activate** — Turn on the workflow and monitor the execution log for any issues.",
      },
      {
        id: "conclusion",
        title: "Conclusion",
        content:
          "Automation eliminates repetitive tasks and reduces human error. Whether you're automating content workflows, data processing, or monitoring, n8n provides a flexible and powerful platform. Start with a simple workflow and gradually add complexity as you identify more automation opportunities.",
      },
    ],
  },
  "json-formatting-best-practices": {
    id: "json-formatting-best-practices",
    title: "JSON Formatting and Validation Best Practices",
    category: "Developer Guides",
    date: "February 25, 2026",
    readTime: "4 min read",
    sections: [
      {
        id: "introduction",
        title: "Introduction",
        content:
          "JSON (JavaScript Object Notation) is the lingua franca of web APIs and data exchange. Despite its simplicity, working with JSON can be error-prone — especially with large, deeply nested structures. This guide covers best practices for formatting, validating, and debugging JSON effectively.",
      },
      {
        id: "formatting-rules",
        title: "Formatting Rules",
        content:
          "Well-formatted JSON improves readability and reduces errors:\n\n• **Use consistent indentation** — 2 or 4 spaces (never tabs in JSON).\n• **Keep keys lowercase** — Use snake_case or camelCase consistently.\n• **Quote all keys** — JSON requires double-quoted keys, unlike JavaScript objects.\n• **Avoid trailing commas** — JSON parsers will reject trailing commas.\n• **Use null over empty strings** — Represent missing values as null rather than empty strings for clarity.",
      },
      {
        id: "validation",
        title: "Validation Techniques",
        content:
          "Always validate JSON before sending or storing it:\n\n1. **Syntax validation** — Use TVK Tools' JSON Formatter to catch syntax errors instantly.\n2. **Schema validation** — Define a JSON Schema to enforce structure, types, and required fields.\n3. **Type checking** — Verify that values match expected types (string, number, boolean, array, object).\n4. **Size limits** — Set maximum payload sizes to prevent memory issues with large JSON files.\n5. **Encoding** — Ensure proper UTF-8 encoding, especially for international characters.",
      },
      {
        id: "common-pitfalls",
        title: "Common Pitfalls",
        content:
          "These are the most frequent JSON-related issues developers encounter:\n\n• **Single quotes** — JSON only supports double quotes. Single quotes will cause parse errors.\n• **Unescaped characters** — Newlines, tabs, and backslashes must be escaped within strings.\n• **Number precision** — JSON numbers can lose precision for very large integers. Use strings for IDs.\n• **Date formats** — JSON has no native date type. Use ISO 8601 strings (e.g., \"2026-03-08T12:00:00Z\").\n• **Circular references** — JSON cannot represent circular structures. Flatten or restructure your data.",
      },
      {
        id: "conclusion",
        title: "Conclusion",
        content:
          "Clean JSON is foundational to reliable APIs and data pipelines. Use TVK Tools' JSON Formatter and Validator to catch issues early, and follow these best practices to avoid common pitfalls. Your future self (and your API consumers) will thank you.",
      },
    ],
  },
  "image-optimization-web": {
    id: "image-optimization-web",
    title: "Image Optimization for the Web: A Complete Guide",
    category: "Tool Tutorials",
    date: "February 20, 2026",
    readTime: "7 min read",
    sections: [
      {
        id: "introduction",
        title: "Introduction",
        content:
          "Images account for roughly 50% of a typical webpage's total size. Optimizing images is one of the highest-impact performance improvements you can make. This guide covers modern image formats, compression strategies, and implementation techniques for faster-loading websites.",
      },
      {
        id: "image-formats",
        title: "Choosing the Right Format",
        content:
          "Each image format has specific strengths:\n\n**WebP** — Best all-around format for the web. 25-35% smaller than JPEG at equivalent quality. Supports transparency.\n\n**AVIF** — Next-generation format with superior compression. ~50% smaller than JPEG. Limited but growing browser support.\n\n**JPEG** — Ideal for photographs. Universal support. Use quality 75-85 for a good balance.\n\n**PNG** — Best for graphics with transparency, sharp edges, or text. Larger file sizes than WebP.\n\n**SVG** — Perfect for icons, logos, and simple illustrations. Infinitely scalable, tiny file sizes.",
      },
      {
        id: "compression",
        title: "Compression Strategies",
        content:
          "Effective compression reduces file size without noticeable quality loss:\n\n1. **Lossy compression** — Removes some data permanently. Best for photos where minor quality loss is acceptable.\n2. **Lossless compression** — Reduces size without any quality loss. Best for graphics and screenshots.\n3. **Responsive images** — Serve different sizes based on viewport width using srcset and sizes attributes.\n4. **Lazy loading** — Load images only when they enter the viewport using loading=\"lazy\".\n5. **CDN delivery** — Serve images from edge servers closest to the user for faster delivery.",
      },
      {
        id: "implementation",
        title: "Implementation Tips",
        content:
          "Apply these techniques in your projects:\n\n• **Set explicit dimensions** — Always specify width and height to prevent layout shifts (CLS).\n• **Use aspect-ratio** — The CSS aspect-ratio property reserves space before images load.\n• **Preload hero images** — Use <link rel=\"preload\"> for above-the-fold images.\n• **Generate multiple sizes** — Create 2-3 size variants (mobile, tablet, desktop) for each image.\n• **Automate with tools** — Use TVK Tools' Image Resizer and Converter to batch-process images efficiently.",
      },
      {
        id: "conclusion",
        title: "Conclusion",
        content:
          "Image optimization is not optional — it directly impacts user experience, SEO rankings, and conversion rates. Start with format selection, apply appropriate compression, and implement lazy loading. Use TVK Tools to automate the process and maintain consistently fast-loading pages.",
      },
    ],
  },
  "meta-tags-seo-guide": {
    id: "meta-tags-seo-guide",
    title: "Meta Tags That Actually Improve Your SEO Rankings",
    category: "SEO Strategies",
    date: "February 15, 2026",
    readTime: "5 min read",
    sections: [
      {
        id: "introduction",
        title: "Introduction",
        content:
          "Meta tags are HTML elements that provide metadata about your webpage to search engines and social platforms. While not all meta tags impact rankings directly, the right ones can significantly improve your visibility and click-through rates. This guide separates the essential tags from the obsolete ones.",
      },
      {
        id: "essential-tags",
        title: "Essential Meta Tags",
        content:
          "These meta tags have the most impact on SEO and should be on every page:\n\n**Title tag** — The single most important on-page SEO element. Keep it under 60 characters, include your target keyword near the beginning, and make it compelling.\n\n**Meta description** — Appears in search results below the title. Keep it under 160 characters. Write it as a call-to-action that encourages clicks.\n\n**Canonical tag** — Prevents duplicate content issues by specifying the preferred URL for a page.\n\n**Robots meta tag** — Controls how search engines crawl and index your page (index/noindex, follow/nofollow).\n\n**Viewport meta tag** — Essential for mobile responsiveness. Ensures proper rendering on all devices.",
      },
      {
        id: "social-tags",
        title: "Social Media Meta Tags",
        content:
          "These tags control how your content appears when shared on social platforms:\n\n**Open Graph (og:) tags** — Used by Facebook, LinkedIn, and most platforms. Include og:title, og:description, og:image, and og:url.\n\n**Twitter Card tags** — Control the appearance of links shared on Twitter. Use twitter:card, twitter:title, twitter:description, and twitter:image.\n\n**Best practices:**\n• Use images sized 1200×630 pixels for optimal display across platforms.\n• Test your tags with platform-specific validators before publishing.\n• Update og:image when refreshing content to encourage re-sharing.",
      },
      {
        id: "using-generator",
        title: "Using TVK Tools' Meta Tag Generator",
        content:
          "TVK Tools' Meta Tag Generator simplifies the process:\n\n1. **Enter your page details** — Title, description, URL, and target keywords.\n2. **Preview results** — See how your page will appear in Google search results and social shares.\n3. **Generate code** — Copy the complete HTML meta tag block ready to paste into your page.\n4. **Validate** — The tool checks character limits and warns about common issues.\n5. **Export** — Download the tags or copy them directly to your clipboard.\n\nThe generator also creates JSON-LD structured data for enhanced search result appearances.",
      },
      {
        id: "conclusion",
        title: "Conclusion",
        content:
          "Meta tags are a low-effort, high-impact SEO technique. Focus on title tags and meta descriptions for search visibility, add Open Graph tags for social sharing, and use canonical tags to manage duplicate content. TVK Tools' Meta Tag Generator handles the technical details so you can focus on crafting compelling copy.",
      },
    ],
  },
};

const BlogPost = () => {
  const { id } = useParams<{ id: string }>();
  const post = id ? blogPostsData[id] : null;

  if (!post) {
    return (
      <div className="cyber-grid min-h-screen py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-heading text-2xl font-bold text-primary neon-text">Post Not Found</h1>
          <p className="mt-4 text-sm text-muted-foreground">The blog post you're looking for doesn't exist.</p>
          <Link to="/blog">
            <Button variant="outline" className="mt-6 border-primary/30 font-heading text-xs">
              <ArrowLeft className="mr-2 h-3 w-3" /> Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link copied", description: "Article URL copied to clipboard." });
  };

  const shareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`,
      "_blank"
    );
  };

  const shareLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
      "_blank"
    );
  };

  return (
    <div className="cyber-grid min-h-screen py-16">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-primary truncate max-w-[200px]">{post.title}</span>
        </nav>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_240px]">
          {/* Main Content */}
          <article>
            {/* Header */}
            <div className="flex items-center gap-3">
              <span className="rounded bg-primary/10 px-2 py-0.5 font-heading text-[10px] text-primary">
                {post.category}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Calendar className="h-3 w-3" /> {post.date}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock className="h-3 w-3" /> {post.readTime}
              </span>
            </div>

            <h1 className="mt-4 font-heading text-2xl font-bold text-primary neon-text leading-tight sm:text-3xl">
              {post.title}
            </h1>

            {/* Share buttons (top) */}
            <div className="mt-6 flex items-center gap-2">
              <span className="text-[10px] font-heading text-muted-foreground uppercase tracking-wider">Share</span>
              <button onClick={shareTwitter} className="rounded border border-primary/20 p-1.5 text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors" aria-label="Share on Twitter">
                <Twitter className="h-3.5 w-3.5" />
              </button>
              <button onClick={shareLinkedIn} className="rounded border border-primary/20 p-1.5 text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors" aria-label="Share on LinkedIn">
                <Linkedin className="h-3.5 w-3.5" />
              </button>
              <button onClick={copyLink} className="rounded border border-primary/20 p-1.5 text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors" aria-label="Copy link">
                <LinkIcon className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Article sections */}
            <div className="mt-8 space-y-8">
              {post.sections.map((section) => (
                <section key={section.id} id={section.id}>
                  <h2 className="font-heading text-lg font-bold text-foreground border-l-2 border-primary pl-3">
                    {section.title}
                  </h2>
                  <div className="mt-3 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {section.content.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
                      if (part.startsWith("**") && part.endsWith("**")) {
                        return <strong key={i} className="text-foreground">{part.slice(2, -2)}</strong>;
                      }
                      return part;
                    })}
                  </div>
                </section>
              ))}
            </div>

            {/* Bottom nav */}
            <div className="mt-12 border-t border-primary/10 pt-6">
              <Link to="/blog">
                <Button variant="outline" className="border-primary/30 font-heading text-xs">
                  <ArrowLeft className="mr-2 h-3 w-3" /> Back to All Posts
                </Button>
              </Link>
            </div>
          </article>

          {/* Sidebar — Table of Contents */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded border border-primary/10 bg-card p-5">
              <h3 className="font-heading text-xs font-bold text-primary uppercase tracking-wider">
                Table of Contents
              </h3>
              <nav className="mt-4 space-y-2">
                {post.sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block text-xs text-muted-foreground hover:text-primary transition-colors pl-2 border-l border-primary/10 hover:border-primary/50"
                  >
                    {section.title}
                  </a>
                ))}
              </nav>

              {/* Share sidebar */}
              <div className="mt-6 border-t border-primary/10 pt-4">
                <h3 className="font-heading text-xs font-bold text-primary uppercase tracking-wider">
                  Share Article
                </h3>
                <div className="mt-3 flex gap-2">
                  <button onClick={shareTwitter} className="flex-1 rounded border border-primary/20 py-1.5 text-[10px] text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors flex items-center justify-center gap-1">
                    <Twitter className="h-3 w-3" /> Twitter
                  </button>
                  <button onClick={shareLinkedIn} className="flex-1 rounded border border-primary/20 py-1.5 text-[10px] text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors flex items-center justify-center gap-1">
                    <Linkedin className="h-3 w-3" /> LinkedIn
                  </button>
                </div>
                <button onClick={copyLink} className="mt-2 w-full rounded border border-primary/20 py-1.5 text-[10px] text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors flex items-center justify-center gap-1">
                  <LinkIcon className="h-3 w-3" /> Copy Link
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
