import { Brain, Search, Code, Image, Wrench, type LucideIcon } from "lucide-react";

export type ToolCategory = "ai" | "seo" | "developer" | "image" | "utility";

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: string;
  isFree: boolean;
  isPopular?: boolean;
  isNew?: boolean;
  type: "frontend" | "backend";
}

export interface Category {
  id: ToolCategory;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  toolCount: number;
}

export const categories: Category[] = [
  { id: "ai", name: "AI Tools", description: "AI-powered generation and analysis", icon: Brain, color: "neon-cyan", toolCount: 15 },
  { id: "seo", name: "SEO Tools", description: "Optimize your search rankings", icon: Search, color: "neon-magenta", toolCount: 13 },
  { id: "developer", name: "Developer Tools", description: "Code formatting and utilities", icon: Code, color: "neon-yellow", toolCount: 15 },
  { id: "image", name: "Image Tools", description: "Image conversion and editing", icon: Image, color: "neon-blue", toolCount: 10 },
  { id: "utility", name: "Utility Tools", description: "Everyday productivity tools", icon: Wrench, color: "neon-cyan", toolCount: 16 },
];

export const tools: Tool[] = [
  // AI Tools
  { id: "ai-prompt-generator", name: "AI Prompt Generator", description: "Generate optimized prompts for any AI model", category: "ai", icon: "✨", isFree: true, isPopular: true, type: "backend" },
  { id: "ai-blog-title", name: "AI Blog Title Generator", description: "Create catchy blog titles with AI", category: "ai", icon: "📝", isFree: true, isPopular: true, type: "backend" },
  { id: "ai-image-prompt", name: "AI Image Prompt Generator", description: "Generate detailed image generation prompts", category: "ai", icon: "🎨", isFree: true, type: "backend" },
  { id: "ai-tweet-generator", name: "AI Tweet Generator", description: "Create viral tweets with AI assistance", category: "ai", icon: "🐦", isFree: false, type: "backend" },
  { id: "ai-hashtag-generator", name: "AI Hashtag Generator", description: "Generate trending hashtags for social media", category: "ai", icon: "#️⃣", isFree: true, type: "backend" },
  { id: "ai-bio-generator", name: "AI Bio Generator", description: "Create professional bios for any platform", category: "ai", icon: "👤", isFree: true, type: "backend" },
  { id: "ai-product-desc", name: "AI Product Description", description: "Generate compelling product descriptions", category: "ai", icon: "🛍️", isFree: false, type: "backend" },
  { id: "ai-email-generator", name: "AI Email Generator", description: "Craft professional emails in seconds", category: "ai", icon: "📧", isFree: false, type: "backend" },
  { id: "ai-code-generator", name: "AI Code Generator", description: "Generate code snippets with AI", category: "ai", icon: "💻", isFree: false, type: "backend" },
  { id: "ai-chat", name: "AI Chat Assistant", description: "Chat with an intelligent AI assistant", category: "ai", icon: "🤖", isFree: false, type: "backend" },
  { id: "ai-summarizer", name: "AI Text Summarizer", description: "Summarize long articles and documents instantly", category: "ai", icon: "📄", isFree: true, isNew: true, type: "backend" },
  { id: "ai-paraphraser", name: "AI Paraphraser", description: "Rewrite text in different tones and styles", category: "ai", icon: "🔄", isFree: true, type: "backend" },
  { id: "ai-story-generator", name: "AI Story Generator", description: "Generate creative stories from prompts", category: "ai", icon: "📖", isFree: false, isNew: true, type: "backend" },
  { id: "ai-slogan-generator", name: "AI Slogan Generator", description: "Create catchy slogans for brands and products", category: "ai", icon: "💡", isFree: true, type: "backend" },
  { id: "ai-grammar-checker", name: "AI Grammar Checker", description: "Fix grammar, spelling, and punctuation errors", category: "ai", icon: "✏️", isFree: true, isPopular: true, type: "backend" },

  // SEO Tools
  { id: "keyword-suggestions", name: "Keyword Suggestions", description: "Discover high-value keywords for your content", category: "seo", icon: "🔑", isFree: true, isPopular: true, type: "backend" },
  { id: "meta-tag-generator", name: "Meta Tag Generator", description: "Generate optimized meta tags for SEO", category: "seo", icon: "🏷️", isFree: true, isPopular: true, type: "frontend" },
  { id: "keyword-density", name: "Keyword Density Checker", description: "Analyze keyword density in your content", category: "seo", icon: "📊", isFree: true, type: "frontend" },
  { id: "serp-preview", name: "SERP Preview Tool", description: "Preview how your page appears in search results", category: "seo", icon: "👁️", isFree: true, type: "frontend" },
  { id: "seo-title-generator", name: "SEO Title Generator", description: "Create SEO-optimized page titles", category: "seo", icon: "📰", isFree: true, type: "backend" },
  { id: "competitor-keywords", name: "Competitor Keyword Finder", description: "Find keywords your competitors rank for", category: "seo", icon: "🕵️", isFree: false, type: "backend" },
  { id: "seo-audit", name: "SEO Page Audit", description: "Full SEO audit of any webpage", category: "seo", icon: "📋", isFree: false, type: "backend" },
  { id: "backlink-checker", name: "Backlink Checker", description: "Analyze backlinks for any domain", category: "seo", icon: "🔗", isFree: false, type: "backend" },
  { id: "domain-authority", name: "Domain Authority Checker", description: "Check domain authority score", category: "seo", icon: "🏆", isFree: false, type: "backend" },
  { id: "competitor-ranking", name: "Competitor Ranking Keywords", description: "See what keywords competitors rank for", category: "seo", icon: "📈", isFree: false, type: "backend" },
  { id: "readability-checker", name: "Readability Checker", description: "Analyze content readability score and grade level", category: "seo", icon: "📖", isFree: true, isNew: true, type: "frontend" },
  { id: "slug-generator", name: "URL Slug Generator", description: "Generate SEO-friendly URL slugs", category: "seo", icon: "🔗", isFree: true, type: "frontend" },
  { id: "open-graph-generator", name: "Open Graph Generator", description: "Generate Open Graph meta tags for social sharing", category: "seo", icon: "🌐", isFree: true, type: "frontend" },

  // Developer Tools
  { id: "json-formatter", name: "JSON Formatter", description: "Format and beautify JSON data", category: "developer", icon: "{ }", isFree: true, isPopular: true, type: "frontend" },
  { id: "json-validator", name: "JSON Validator", description: "Validate JSON syntax and structure", category: "developer", icon: "✅", isFree: true, type: "frontend" },
  { id: "base64-encoder", name: "Base64 Encoder", description: "Encode text to Base64 format", category: "developer", icon: "🔐", isFree: true, type: "frontend" },
  { id: "base64-decoder", name: "Base64 Decoder", description: "Decode Base64 to plain text", category: "developer", icon: "🔓", isFree: true, type: "frontend" },
  { id: "jwt-decoder", name: "JWT Decoder", description: "Decode and inspect JWT tokens", category: "developer", icon: "🎟️", isFree: true, isNew: true, type: "frontend" },
  { id: "timestamp-converter", name: "Timestamp Converter", description: "Convert between timestamp formats", category: "developer", icon: "⏰", isFree: true, type: "frontend" },
  { id: "html-minifier", name: "HTML Minifier", description: "Minify HTML for better performance", category: "developer", icon: "📄", isFree: true, type: "frontend" },
  { id: "css-minifier", name: "CSS Minifier", description: "Compress CSS files", category: "developer", icon: "🎨", isFree: true, type: "frontend" },
  { id: "js-minifier", name: "JavaScript Minifier", description: "Minify JavaScript code", category: "developer", icon: "⚡", isFree: true, type: "frontend" },
  { id: "regex-tester", name: "Regex Tester", description: "Test and debug regular expressions", category: "developer", icon: "🔍", isFree: true, isNew: true, type: "frontend" },
  { id: "json-to-csv", name: "JSON to CSV Converter", description: "Convert JSON data to CSV format", category: "developer", icon: "📊", isFree: true, type: "frontend" },
  { id: "csv-to-json", name: "CSV to JSON Converter", description: "Convert CSV data to JSON format", category: "developer", icon: "📋", isFree: true, type: "frontend" },
  { id: "color-converter", name: "Color Converter", description: "Convert between HEX, RGB, HSL color formats", category: "developer", icon: "🎨", isFree: true, type: "frontend" },
  { id: "markdown-preview", name: "Markdown Preview", description: "Preview markdown with live rendering", category: "developer", icon: "📝", isFree: true, type: "frontend" },
  { id: "sql-formatter", name: "SQL Formatter", description: "Format and beautify SQL queries", category: "developer", icon: "🗃️", isFree: true, isNew: true, type: "frontend" },

  // Image Tools
  { id: "image-converter", name: "Image Converter", description: "Convert images between formats", category: "image", icon: "🖼️", isFree: true, type: "frontend" },
  { id: "image-compressor", name: "Image Compressor", description: "Compress images without quality loss", category: "image", icon: "📦", isFree: true, isPopular: true, type: "frontend" },
  { id: "image-resizer", name: "Image Resizer", description: "Resize images to any dimension", category: "image", icon: "📐", isFree: true, type: "frontend" },
  { id: "image-base64", name: "Image Base64 Converter", description: "Convert images to/from Base64", category: "image", icon: "🔄", isFree: true, type: "frontend" },
  { id: "image-metadata", name: "Image Metadata Viewer", description: "View EXIF and metadata of images", category: "image", icon: "ℹ️", isFree: true, type: "frontend" },
  { id: "image-cropper", name: "Image Cropper", description: "Crop images to custom sizes", category: "image", icon: "✂️", isFree: true, type: "frontend" },
  { id: "image-format", name: "Image Format Converter", description: "Convert between image formats", category: "image", icon: "🔀", isFree: true, type: "frontend" },
  { id: "mini-studio", name: "Mini Image Studio", description: "Basic image editing in browser", category: "image", icon: "🎬", isFree: false, isNew: true, type: "frontend" },

  // Utility Tools
  { id: "qr-generator", name: "QR Code Generator", description: "Generate QR codes for any URL or text", category: "utility", icon: "📱", isFree: true, isPopular: true, type: "frontend" },
  { id: "password-generator", name: "Password Generator", description: "Generate secure random passwords", category: "utility", icon: "🔒", isFree: true, isPopular: true, type: "frontend" },
  { id: "word-counter", name: "Word Counter", description: "Count words, characters, and sentences", category: "utility", icon: "📝", isFree: true, type: "frontend" },
  { id: "text-case", name: "Text Case Converter", description: "Convert text between different cases", category: "utility", icon: "Aa", isFree: true, type: "frontend" },
  { id: "uuid-generator", name: "UUID Generator", description: "Generate unique UUIDs instantly", category: "utility", icon: "🆔", isFree: true, type: "frontend" },
  { id: "hash-generator", name: "Hash Generator", description: "Generate MD5, SHA-1, SHA-256 hashes", category: "utility", icon: "#", isFree: true, type: "frontend" },
  { id: "url-encoder", name: "URL Encoder", description: "Encode URLs for safe sharing", category: "utility", icon: "🔗", isFree: true, type: "frontend" },
  { id: "url-decoder", name: "URL Decoder", description: "Decode encoded URLs", category: "utility", icon: "🔓", isFree: true, type: "frontend" },
  { id: "random-number", name: "Random Number Generator", description: "Generate random numbers in any range", category: "utility", icon: "🎲", isFree: true, type: "frontend" },
  { id: "secret-keys", name: "Secret Keys Generator", description: "Generate secure API keys and secrets", category: "utility", icon: "🗝️", isFree: true, isNew: true, type: "frontend" },
  { id: "smtp-tester", name: "SMTP Tester", description: "Test SMTP server connections", category: "utility", icon: "📮", isFree: false, type: "backend" },
];

export const getToolsByCategory = (category: ToolCategory) => tools.filter(t => t.category === category);
export const getPopularTools = () => tools.filter(t => t.isPopular);
export const getNewTools = () => tools.filter(t => t.isNew);
export const getFreeTools = () => tools.filter(t => t.isFree);
export const getToolById = (id: string) => tools.find(t => t.id === id);
