import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Copy, Check, ArrowLeft, Download, Play, Lock } from "lucide-react";
import { getToolById, tools } from "@/data/tools";
import { runFrontendTool, getToolPlaceholder, getToolFaq } from "@/lib/toolEngine";
import ToolCard from "@/components/ToolCard";
import { useAuth } from "@/contexts/AuthContext";
import { useTrackToolUsage } from "@/hooks/useTrackToolUsage";

const ToolPage = () => {
  const { id } = useParams<{ id: string }>();
  const tool = id ? getToolById(id) : undefined;
  const { user } = useAuth();
  const { trackUsage } = useTrackToolUsage();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const requiresLogin = tool && !tool.isFree && !user;

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
  const relatedTools = tools.filter((t) => t.category === tool.category && t.id !== tool.id).slice(0, 4);

  const handleRun = () => {
    setLoading(true);
    setTimeout(() => {
      const result = runFrontendTool(tool.id, input || placeholder);
      setOutput(result);
      setLoading(false);
    }, 300);
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
      <div className="container mx-auto px-4">
        <Link to="/tools" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-3 w-3" /> All Tools
        </Link>

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

        {/* Login Gate */}
        {requiresLogin && (
          <div className="mt-8 rounded border border-secondary/30 bg-card p-8 text-center neon-glow-magenta">
            <Lock className="mx-auto h-8 w-8 text-secondary" />
            <h3 className="mt-3 font-heading text-lg font-bold text-secondary neon-text-magenta">Pro Tool — Login Required</h3>
            <p className="mt-2 text-sm text-muted-foreground">Sign in or create an account to use this tool.</p>
            <div className="mt-4 flex justify-center gap-3">
              <Link to="/login" className="rounded border border-primary/30 px-6 py-2 font-heading text-xs text-primary hover:bg-primary/10">Login</Link>
              <Link to="/signup" className="rounded bg-primary px-6 py-2 font-heading text-xs text-primary-foreground neon-glow">Sign Up Free</Link>
            </div>
          </div>
        )}

        {/* Tool Interface */}
        {!requiresLogin && (<div className="mt-8 grid gap-6 lg:grid-cols-2">
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
                <span className="animate-pulse-neon">Processing...</span>
              ) : (
                <>
                  <Play className="h-4 w-4" /> Run Tool
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
              {output && (
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 rounded border border-primary/20 px-2 py-1 text-[10px] text-muted-foreground transition-all hover:text-primary"
                  >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1 rounded border border-primary/20 px-2 py-1 text-[10px] text-muted-foreground transition-all hover:text-primary"
                  >
                    <Download className="h-3 w-3" /> Download
                  </button>
                </div>
              )}
            </div>
            <pre className="flex-1 min-h-[300px] overflow-auto rounded border border-primary/20 bg-card p-4 font-body text-sm text-foreground whitespace-pre-wrap">
              {output || "Results will appear here..."}
            </pre>
          </div>
        </div>
        )}

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
