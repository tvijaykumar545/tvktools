import { useState, useRef, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Copy, Check, ArrowLeft, Download, Play, Lock, Loader2, Heart, ImageIcon } from "lucide-react";
import ImageToolInterface, { isImageTool } from "@/components/ImageToolInterface";
import QRCodeGenerator from "@/components/QRCodeGenerator";
import PDFToolInterface, { isPdfTool } from "@/components/PDFToolInterface";
import PDFReorderTool from "@/components/PDFReorderTool";
import { getToolById as getStaticToolById, tools as staticTools } from "@/data/tools";
import { runFrontendTool, getToolPlaceholder, getToolFaq, getToolDemoOutput } from "@/lib/toolEngine";
import ToolCard from "@/components/ToolCard";
import SEOHead from "@/components/SEOHead";
import ShareButtons from "@/components/ShareButtons";
import { useAuth } from "@/contexts/AuthContext";
import { useTrackToolUsage } from "@/hooks/useTrackToolUsage";
import { useToolFavorites } from "@/hooks/useToolFavorites";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import ToolRating from "@/components/ToolRating";

import { useManagedTools } from "@/hooks/useManagedTools";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import UsageLimitBanner from "@/components/UsageLimitBanner";

const ToolPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: dbTools } = useManagedTools();
  const mergedTools = useMemo(() => {
    if (!dbTools || dbTools.length === 0) return staticTools;
    const dbIds = new Set(dbTools.map(t => t.id));
    const missingStatic = staticTools.filter(t => !dbIds.has(t.id));
    return [...dbTools, ...missingStatic];
  }, [dbTools]);
  const tool = id ? mergedTools.find(t => t.id === id) : undefined;
  const { user } = useAuth();
  const { trackUsage } = useTrackToolUsage();
  const { isFavorite, toggleFavorite } = useToolFavorites();
  const { remaining, isLimitReached, consumeUsage, dailyLimit, isGuest } = useUsageLimit();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const isImageGenerator = tool?.id === "ai-image-generator";
  const isQRGenerator = tool?.id === "qr-generator";
  const hasCustomUI = isImageTool(tool?.id ?? "") || isQRGenerator || isPdfTool(tool?.id ?? "");
  const demoText = useMemo(() => tool ? getToolDemoOutput(tool.id) : "", [tool?.id]);
  const { displayed: typedDemo, isTyping } = useTypingEffect(requiresLogin ? demoText : "", 15);

  if (!tool) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-2xl text-primary">Tool not found</h1>
          <Link to="/tools" className="mt-4 inline-block text-sm text-muted-foreground hover:text-primary">← Back to tools</Link>
        </div>
      </div>
    );
  }

  const placeholder = getToolPlaceholder(tool.id);
  const faqs = getToolFaq(tool.id);
  const relatedTools = mergedTools.filter((t) => t.category === tool.category && t.id !== tool.id).slice(0, 4);

  const handleRun = async () => {
    if (loading) {
      abortRef.current?.abort();
      return;
    }
    if (!consumeUsage()) {
      toast.error("Daily limit reached! Sign up for unlimited access.");
      return;
    }
    setLoading(true);
    setOutput("");
    setGeneratedImage(null);

    if (tool.type === "frontend") {
      setTimeout(() => {
        const result = runFrontendTool(tool.id, input || placeholder);
        setOutput(result);
        setLoading(false);
        trackUsage(tool.id, tool.name, tool.category);
      }, 300);
      return;
    }

    // Image generator - non-streaming
    if (isImageGenerator) {
      const userInput = input || placeholder;
      try {
        const resp = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-image-gen`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ prompt: userInput }),
          }
        );
        const data = await resp.json();
        if (!resp.ok) {
          toast.error(data.error || "Image generation failed");
          setOutput(data.error || "Error generating image.");
        } else {
          setGeneratedImage(data.imageUrl);
          setOutput(data.description || "Image generated successfully!");
          trackUsage(tool.id, tool.name, tool.category);
        }
      } catch (e: any) {
        toast.error("Failed to generate image. Please try again.");
        setOutput("Error: Failed to connect to AI service.");
      } finally {
        setLoading(false);
      }
      return;
    }

    // Backend AI tool - stream from edge function
    const controller = new AbortController();
    abortRef.current = controller;
    const userInput = input || placeholder;

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tool`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ toolId: tool.id, input: userInput }),
          signal: controller.signal,
        }
      );

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "AI processing failed" }));
        toast.error(err.error || "AI processing failed");
        setOutput(err.error || "Error processing request.");
        setLoading(false);
        return;
      }

      if (!resp.body) {
        setOutput("Error: No response stream");
        setLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let fullOutput = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullOutput += content;
              setOutput(fullOutput);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      trackUsage(tool.id, tool.name, tool.category);
    } catch (e: any) {
      if (e.name !== "AbortError") {
        toast.error("Failed to process. Please try again.");
        setOutput("Error: Failed to connect to AI service.");
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tool.id}-result.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="cyber-grid min-h-screen py-8">
      <SEOHead
        title={tool.name}
        description={tool.description}
        path={`/tool/${tool.id}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: tool.name,
          description: tool.description,
          applicationCategory: "WebApplication",
          operatingSystem: "Web",
          offers: {
            "@type": "Offer",
            price: tool.isFree ? "0" : "9.99",
            priceCurrency: "USD",
          },
        }}
      />
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link to="/tools" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-3 w-3" /> All Tools
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleFavorite(tool.id, tool.name, tool.category)}
              className="flex items-center gap-1 rounded border border-primary/20 px-3 py-1.5 text-xs transition-all hover:border-primary/50"
            >
              <Heart
                className={`h-3.5 w-3.5 transition-colors ${isFavorite(tool.id) ? "fill-destructive text-destructive" : "text-muted-foreground"}`}
              />
              <span className={isFavorite(tool.id) ? "text-destructive" : "text-muted-foreground"}>
                {isFavorite(tool.id) ? "Saved" : "Save"}
              </span>
            </button>
            <ShareButtons title={`${tool.name} — TVK Tools`} url={`/tool/${tool.id}`} />
          </div>
        </div>

        {/* Hero */}
        <div className="mt-4 flex items-start gap-4">
          <span className="text-4xl">{tool.icon}</span>
          <div>
            <h1 className="font-heading text-2xl font-bold text-primary neon-text md:text-3xl">
              {tool.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{tool.description}</p>
            <div className="mt-2 flex gap-2">
              <span className="rounded bg-primary/10 px-2 py-0.5 font-heading text-[10px] text-primary uppercase">
                {tool.category}
              </span>
              <span className="rounded bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                {tool.type === "frontend" ? "⚡ Instant" : "🤖 AI-Powered"}
              </span>
              {tool.isFree && (
                <span className="rounded bg-primary/10 px-2 py-0.5 font-heading text-[10px] text-primary">FREE</span>
              )}
            </div>
          </div>
        </div>

        {/* Demo Preview & Login Gate */}
        {requiresLogin && (
          <div className="mt-8 space-y-6">
            {/* Demo Output Preview */}
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="h-4 w-4 text-primary" />
                <label className="font-heading text-xs font-semibold text-foreground uppercase tracking-wider">
                  Sample Output Preview
                </label>
              </div>
              <div className="relative overflow-hidden rounded border border-primary/20 bg-card">
                <pre className="p-4 font-body text-sm text-foreground whitespace-pre-wrap min-h-[200px] max-h-[250px] overflow-hidden">
                  {typedDemo}
                  {isTyping && <span className="inline-block w-1.5 h-4 bg-primary animate-pulse ml-0.5 align-middle" />}
                </pre>
                {/* Blur overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                  <Lock className="h-8 w-8 text-secondary mb-3" />
                  <h3 className="font-heading text-lg font-bold text-secondary neon-text-magenta">
                    Sign Up to Unlock Full Results
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-md">
                    Create a free account to run this tool with your own input and get complete, downloadable results.
                  </p>
                  <div className="mt-4 flex gap-3">
                    <Link
                      to="/login"
                      className="rounded border border-primary/30 px-6 py-2 font-heading text-xs text-primary hover:bg-primary/10 transition-all"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="rounded bg-primary px-6 py-2 font-heading text-xs text-primary-foreground neon-glow transition-all hover:bg-primary/90"
                    >
                      Sign Up Free
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Usage Limit Banner */}
        {!requiresLogin && (
          <div className="mt-6">
            <UsageLimitBanner remaining={remaining} dailyLimit={dailyLimit} isLimitReached={isLimitReached} isGuest={isGuest} />
          </div>
        )}

        {/* Limit Reached Gate */}
        {!requiresLogin && isLimitReached && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Tool disabled until you sign up or wait until tomorrow.
          </div>
        )}

        {/* Tool Interface */}
        {!requiresLogin && !isLimitReached && tool.id === "qr-generator" && (
          <QRCodeGenerator onTrackUsage={() => { consumeUsage(); trackUsage(tool.id, tool.name, tool.category); }} />
        )}

        {!requiresLogin && !isLimitReached && isImageTool(tool.id) && (
          <ImageToolInterface
            toolId={tool.id}
            toolName={tool.name}
            onTrackUsage={() => { consumeUsage(); trackUsage(tool.id, tool.name, tool.category); }}
          />
        )}

        {!requiresLogin && !isLimitReached && tool.id === "reorder-pdf" && (
          <PDFReorderTool onTrackUsage={() => { consumeUsage(); trackUsage(tool.id, tool.name, tool.category); }} />
        )}

        {!requiresLogin && !isLimitReached && isPdfTool(tool.id) && tool.id !== "reorder-pdf" && (
          <PDFToolInterface
            toolId={tool.id}
            toolName={tool.name}
            onTrackUsage={() => { consumeUsage(); trackUsage(tool.id, tool.name, tool.category); }}
          />
        )}

        {!requiresLogin && !isLimitReached && !hasCustomUI && (<div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Input */}
          <div className="flex flex-col gap-3">
            <label className="font-heading text-xs font-semibold text-foreground uppercase tracking-wider">
              Input
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={placeholder}
              rows={12}
              className="flex-1 rounded border border-primary/20 bg-card p-4 font-body text-sm text-foreground placeholder-muted-foreground outline-none transition-all focus:border-primary/50 resize-none"
            />
            <button
              onClick={handleRun}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded bg-primary px-6 py-3 font-heading text-xs font-bold text-primary-foreground transition-all hover:bg-primary/90 neon-glow disabled:opacity-50"
            >
            {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> {isImageGenerator ? "Generating Image..." : tool.type === "backend" ? "Generating..." : "Processing..."}
                </>
              ) : (
                <>
                  {isImageGenerator ? <ImageIcon className="h-4 w-4" /> : <Play className="h-4 w-4" />} {isImageGenerator ? "Generate Image" : "Run Tool"}
                </>
              )}
            </button>
          </div>

          {/* Output */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="font-heading text-xs font-semibold text-foreground uppercase tracking-wider">
                Output
              </label>
              {(output || generatedImage) && (
                <div className="flex gap-2">
                  {!isImageGenerator && (
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 rounded border border-primary/20 px-2 py-1 text-[10px] text-muted-foreground transition-all hover:text-primary"
                    >
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  )}
                  {generatedImage && (
                    <a
                      href={generatedImage}
                      download="ai-generated-image.png"
                      className="flex items-center gap-1 rounded border border-primary/20 px-2 py-1 text-[10px] text-muted-foreground transition-all hover:text-primary"
                    >
                      <Download className="h-3 w-3" /> Download Image
                    </a>
                  )}
                  {!isImageGenerator && (
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-1 rounded border border-primary/20 px-2 py-1 text-[10px] text-muted-foreground transition-all hover:text-primary"
                    >
                      <Download className="h-3 w-3" /> Download
                    </button>
                  )}
                </div>
              )}
            </div>
            {/* Image Generator Output */}
            {isImageGenerator ? (
              <div className="flex-1 min-h-[300px] overflow-auto rounded border border-primary/20 bg-card p-4">
                {generatedImage ? (
                  <div className="flex flex-col items-center gap-4">
                    <img
                      src={generatedImage}
                      alt="AI Generated Image"
                      className="max-w-full rounded-lg border border-primary/10 shadow-lg"
                    />
                    {output && (
                      <p className="text-xs text-muted-foreground text-center">{output}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full min-h-[250px] text-muted-foreground">
                    <ImageIcon className="h-12 w-12 mb-3 opacity-30" />
                    <p className="text-sm">Your generated image will appear here...</p>
                  </div>
                )}
              </div>
            ) : output && tool.type === "backend" ? (
              <div className="flex-1 min-h-[300px] overflow-auto rounded border border-primary/20 bg-card p-4 text-sm text-foreground prose prose-invert prose-sm max-w-none prose-headings:text-primary prose-strong:text-foreground prose-li:text-foreground prose-p:text-foreground">
                <ReactMarkdown>{output}</ReactMarkdown>
              </div>
            ) : (
              <pre className="flex-1 min-h-[300px] overflow-auto rounded border border-primary/20 bg-card p-4 font-body text-sm text-foreground whitespace-pre-wrap">
                {output || "Results will appear here..."}
              </pre>
            )}
          </div>
        </div>
        )}

        {/* Ratings & Feedback */}
        <ToolRating toolId={tool.id} />

        {/* FAQ */}
        <section className="mt-16">
          <h2 className="font-heading text-xl font-bold text-foreground">FAQ</h2>
          <div className="mt-4 space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded border border-primary/10 bg-card p-4">
                <h3 className="font-heading text-xs font-semibold text-primary">{faq.q}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Related */}
        {relatedTools.length > 0 && (
          <section className="mt-16">
            <h2 className="font-heading text-xl font-bold text-foreground">Related Tools</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedTools.map((t) => (
                <ToolCard key={t.id} tool={t} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ToolPage;
