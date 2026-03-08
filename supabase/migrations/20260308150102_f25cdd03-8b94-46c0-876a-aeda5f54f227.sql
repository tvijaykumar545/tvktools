
-- Blog posts table
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'General',
  read_time text NOT NULL DEFAULT '5 min read',
  published boolean NOT NULL DEFAULT false,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can read published posts
CREATE POLICY "Anyone can read published posts"
ON public.blog_posts FOR SELECT TO anon, authenticated
USING (published = true);

-- Admins can do everything
CREATE POLICY "Admins can read all posts"
ON public.blog_posts FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert posts"
ON public.blog_posts FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update posts"
ON public.blog_posts FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete posts"
ON public.blog_posts FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed existing blog posts
INSERT INTO public.blog_posts (slug, title, excerpt, content, category, read_time, published, created_at) VALUES
('getting-started-ai-tools', 'Getting Started with AI Tools for Content Creation', 'Learn how to leverage AI-powered tools to supercharge your content creation workflow. From blog titles to product descriptions, discover the best practices.', E'## Introduction\n\nArtificial intelligence has transformed the way we create content. From generating blog titles to crafting product descriptions, AI-powered tools can dramatically accelerate your workflow while maintaining quality.\n\n## Why Use AI Tools?\n\nAI tools remove creative bottlenecks by offering instant suggestions, variations, and drafts. Whether you''re a solo creator or part of a marketing team, these tools help you:\n\n- Generate ideas faster than brainstorming sessions\n- Maintain consistent tone and style across content\n- Scale content production without hiring additional writers\n- Overcome writer''s block with smart prompts\n\n## Available AI Tools on TVK Tools\n\n**Blog Title Generator** — Input your topic and get 10+ SEO-optimized title suggestions.\n\n**Product Description Writer** — Paste your product details and receive compelling copy.\n\n**AI Grammar Checker** — Fix grammar and spelling errors instantly.\n\n## Best Practices\n\n1. **Provide clear inputs** — The more specific your prompt, the better the output.\n2. **Iterate and refine** — Use AI output as a starting point, then edit for your brand voice.\n3. **Combine tools** — Use the title generator first, then feed the chosen title into the description writer.\n4. **Check for accuracy** — Always verify facts in AI-generated content.\n\n## Conclusion\n\nAI tools are not a replacement for human creativity — they''re an amplifier. Start with the Blog Title Generator and explore from there.', 'AI Tutorials', '5 min read', true, '2026-03-05'),
('seo-keyword-research-guide', 'The Complete Guide to SEO Keyword Research in 2026', 'Master keyword research with our comprehensive guide. Learn how to find high-value keywords, analyze competition, and optimize your content strategy.', E'## Introduction\n\nKeyword research remains the foundation of any successful SEO strategy. In 2026, with evolving search algorithms and AI-powered search experiences, understanding how users search for information is more critical than ever.\n\n## Types of Keywords\n\n**Short-tail keywords** (1-2 words) — High volume, high competition.\n\n**Long-tail keywords** (3+ words) — Lower volume, higher intent.\n\n**LSI keywords** — Semantically related terms that help search engines understand context.\n\n## The Research Process\n\n1. **Seed keywords** — Start with broad terms related to your niche.\n2. **Expand** — Use tools to find related terms and long-tail variations.\n3. **Analyze metrics** — Look at search volume and keyword difficulty.\n4. **Assess intent** — Categorize keywords by intent.\n5. **Prioritize** — Focus on keywords with reasonable volume and low difficulty.\n\n## Conclusion\n\nEffective keyword research is an ongoing process. Use TVK Tools to streamline the technical aspects.', 'SEO Strategies', '8 min read', true, '2026-03-03'),
('automate-workflows-n8n', 'How to Automate Your Workflows with n8n', 'Discover the power of n8n workflow automation and how TVK Tools uses it to process backend tools efficiently and reliably.', E'## Introduction\n\nWorkflow automation is a game-changer for productivity. n8n is an open-source automation platform that connects apps, services, and APIs without writing complex code.\n\n## What is n8n?\n\nn8n is a workflow automation tool with a visual drag-and-drop interface, 200+ integrations, and custom code support.\n\n## Practical Use Cases\n\n- **Content pipeline** — Automatically format, validate, and publish content.\n- **SEO monitoring** — Schedule regular checks of meta tags and keyword rankings.\n- **Social sharing** — Auto-post new articles to social platforms.\n\n## Getting Started\n\n1. Install n8n via Docker, npm, or cloud-hosted version.\n2. Create a workflow with a trigger node.\n3. Add processing nodes to transform your data.\n4. Test thoroughly before activating.\n\n## Conclusion\n\nAutomation eliminates repetitive tasks. Start with a simple workflow and build from there.', 'Automation', '6 min read', true, '2026-02-28'),
('json-formatting-best-practices', 'JSON Formatting and Validation Best Practices', 'Everything developers need to know about JSON formatting, validation, and common pitfalls. Plus tips for working with large JSON files.', E'## Introduction\n\nJSON is the lingua franca of web APIs and data exchange. This guide covers best practices for formatting, validating, and debugging JSON effectively.\n\n## Formatting Rules\n\n- Use consistent indentation (2 or 4 spaces)\n- Keep keys lowercase with consistent casing\n- Quote all keys with double quotes\n- Avoid trailing commas\n- Use null over empty strings for missing values\n\n## Validation Techniques\n\n1. **Syntax validation** — Use TVK Tools'' JSON Formatter.\n2. **Schema validation** — Define a JSON Schema to enforce structure.\n3. **Type checking** — Verify values match expected types.\n\n## Common Pitfalls\n\n- Single quotes (JSON only supports double quotes)\n- Unescaped characters in strings\n- Number precision for large integers\n- No native date type (use ISO 8601)\n\n## Conclusion\n\nClean JSON is foundational to reliable APIs. Use TVK Tools'' JSON Formatter and Validator to catch issues early.', 'Developer Guides', '4 min read', true, '2026-02-25'),
('image-optimization-web', 'Image Optimization for the Web: A Complete Guide', 'Learn how to optimize images for faster loading times, better SEO, and improved user experience. Covers formats, compression, and lazy loading.', E'## Introduction\n\nImages account for roughly 50% of a typical webpage''s total size. Optimizing images is one of the highest-impact performance improvements you can make.\n\n## Choosing the Right Format\n\n**WebP** — Best all-around for the web, 25-35% smaller than JPEG.\n\n**AVIF** — Next-gen with superior compression.\n\n**JPEG** — Ideal for photographs, universal support.\n\n**PNG** — Best for graphics with transparency.\n\n**SVG** — Perfect for icons and logos.\n\n## Compression Strategies\n\n1. Lossy compression for photos\n2. Lossless compression for graphics\n3. Responsive images with srcset\n4. Lazy loading with loading="lazy"\n5. CDN delivery for speed\n\n## Conclusion\n\nImage optimization directly impacts UX, SEO, and conversions. Use TVK Tools to automate the process.', 'Tool Tutorials', '7 min read', true, '2026-02-20'),
('meta-tags-seo-guide', 'Meta Tags That Actually Improve Your SEO Rankings', 'Not all meta tags are equal. Learn which ones matter most for search engines and how to craft them effectively using our Meta Tag Generator.', E'## Introduction\n\nMeta tags provide metadata about your webpage to search engines and social platforms. This guide separates essential tags from obsolete ones.\n\n## Essential Meta Tags\n\n**Title tag** — The most important on-page SEO element. Keep under 60 characters.\n\n**Meta description** — Appears in search results. Keep under 160 characters.\n\n**Canonical tag** — Prevents duplicate content issues.\n\n**Robots meta tag** — Controls crawling and indexing.\n\n## Social Media Meta Tags\n\n**Open Graph tags** — Control appearance on Facebook and LinkedIn.\n\n**Twitter Card tags** — Control appearance on Twitter.\n\nUse images sized 1200×630px for optimal display across platforms.\n\n## Conclusion\n\nFocus on title tags, meta descriptions, canonical tags, and Open Graph tags. Use TVK Tools'' Meta Tag Generator to automate the process.', 'SEO Strategies', '5 min read', true, '2026-02-15');
