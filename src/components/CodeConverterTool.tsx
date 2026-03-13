import { useState, useRef, useEffect } from "react";
import { ChevronDown, ArrowRight, Code, Loader2, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const LANGUAGES = [
  "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "C", "Go",
  "Rust", "Swift", "Kotlin", "PHP", "Ruby", "Scala", "R", "MATLAB",
  "Perl", "Haskell", "Lua", "Dart", "Elixir", "F#", "Clojure",
  "Objective-C", "Visual Basic", "Groovy",
];

const DEFAULT_CODE = `# Example Python code
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))`;

interface Props {
  onTrackUsage: () => void;
}

const LanguageDropdown = ({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const filtered = LANGUAGES.filter((l) =>
    l.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-2 rounded border border-primary/20 bg-card px-4 py-3 min-w-[180px] text-left text-sm text-foreground transition-all hover:border-primary/40"
      >
        <span>{value || placeholder}</span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded border border-primary/20 bg-card shadow-lg z-50 max-h-64 overflow-hidden">
          <div className="p-2 border-b border-primary/10">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search languages..."
              className="w-full px-3 py-2 bg-background text-foreground rounded border border-primary/20 text-sm outline-none focus:border-primary/50"
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    onChange(lang);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    value === lang
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-accent"
                  }`}
                >
                  {lang}
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-muted-foreground text-sm">
                No languages found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const CodeConverterTool = ({ onTrackUsage }: Props) => {
  const { user } = useAuth();
  const [sourceCode, setSourceCode] = useState(DEFAULT_CODE);
  const [targetCode, setTargetCode] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("Python");
  const [targetLanguage, setTargetLanguage] = useState("JavaScript");
  const [isConverting, setIsConverting] = useState(false);
  const [errorSummary, setErrorSummary] = useState("");
  const [copiedSource, setCopiedSource] = useState(false);
  const [copiedTarget, setCopiedTarget] = useState(false);

  const handleCopy = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const swapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    setSourceCode(targetCode || sourceCode);
    setTargetCode("");
    setErrorSummary("");
  };

  const convertCode = async () => {
    if (!sourceCode.trim()) {
      toast.error("Please enter some code to convert");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      toast.error("Please log in to use the Code Converter.");
      return;
    }

    setIsConverting(true);
    setTargetCode("");
    setErrorSummary("");

    try {
      const prompt = `You are a code converter and debugger. The user has provided ${sourceLanguage} code that may contain syntax errors or bugs.

Follow these steps:
1. Analyze the source code for any errors, bugs, or issues.
2. If errors are found, list them briefly.
3. Convert the corrected code to ${targetLanguage}.
4. Add inline comments in the converted code explaining key parts.

Return your response in this exact format (no markdown code fences):

ERRORS_FOUND:
<list each error and fix applied, or write "None" if no errors>

CONVERTED (${targetLanguage}):
<converted code with inline explanatory comments>

${sourceLanguage} source code:
${sourceCode}`;

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tool`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ toolId: "code-converter", input: prompt }),
        }
      );

      if (!resp.ok) {
        const data = await resp.json();
        toast.error(data.error || "Conversion failed. Please try again.");
        setIsConverting(false);
        return;
      }

      // Stream SSE response
      const reader = resp.body?.getReader();
      if (!reader) throw new Error("No response body");

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
              // Parse on the fly for converted section
              const convertedMatch = fullOutput.match(/CONVERTED[\s\S]*?:\n([\s\S]*)/);
              setTargetCode(convertedMatch?.[1]?.trim() || fullOutput);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final parse
      const errorsMatch = fullOutput.match(/ERRORS_FOUND:\n([\s\S]*?)(?=\nCONVERTED|$)/);
      const convertedMatch = fullOutput.match(/CONVERTED[\s\S]*?:\n([\s\S]*)/);
      const errors = errorsMatch?.[1]?.trim() || "";
      const converted = convertedMatch?.[1]?.trim() || fullOutput;

      if (errors && errors.toLowerCase() !== "none") setErrorSummary(errors);
      setTargetCode(converted);
      onTrackUsage();
    } catch (err) {
      console.error("Conversion error:", err);
      toast.error("Failed to convert code. Please try again.");
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="mt-8">
      {/* Language Selection */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
        <LanguageDropdown
          value={sourceLanguage}
          onChange={setSourceLanguage}
          placeholder="Source Language"
        />
        <button
          onClick={swapLanguages}
          className="p-2 rounded-full border border-primary/20 text-muted-foreground transition-all hover:border-primary/40 hover:text-primary"
          title="Swap languages"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
        <LanguageDropdown
          value={targetLanguage}
          onChange={setTargetLanguage}
          placeholder="Target Language"
        />
      </div>

      {/* Convert Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={convertCode}
          disabled={isConverting}
          className="flex items-center gap-2 rounded bg-primary px-6 py-3 font-heading text-xs font-bold text-primary-foreground transition-all hover:bg-primary/90 neon-glow disabled:opacity-50"
        >
          {isConverting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Converting...
            </>
          ) : (
            <>
              <Code className="h-4 w-4" />
              Convert Code
            </>
          )}
        </button>
      </div>

      {/* Error Summary */}
      {errorSummary && (
        <div className="mb-6 rounded border border-yellow-500/30 bg-yellow-500/10 px-4 py-3">
          <p className="font-heading text-xs font-semibold text-foreground mb-1">
            ⚠️ Errors detected & fixed in source code:
          </p>
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
            {errorSummary}
          </pre>
        </div>
      )}

      {/* Code Panels */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Source */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="font-heading text-xs font-semibold text-foreground uppercase tracking-wider">
              Source Code ({sourceLanguage})
            </label>
            {sourceCode && (
              <button
                onClick={() => handleCopy(sourceCode, setCopiedSource)}
                className="flex items-center gap-1 rounded border border-primary/20 px-2 py-1 text-[10px] text-muted-foreground transition-all hover:text-primary"
              >
                {copiedSource ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copiedSource ? "Copied!" : "Copy"}
              </button>
            )}
          </div>
          <textarea
            value={sourceCode}
            onChange={(e) => setSourceCode(e.target.value)}
            placeholder="Enter your source code here..."
            rows={16}
            className="rounded border border-primary/20 bg-card p-4 font-mono text-sm text-foreground placeholder-muted-foreground outline-none transition-all focus:border-primary/50 resize-none"
          />
        </div>

        {/* Target */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="font-heading text-xs font-semibold text-foreground uppercase tracking-wider">
              Converted Code ({targetLanguage})
            </label>
            {targetCode && (
              <button
                onClick={() => handleCopy(targetCode, setCopiedTarget)}
                className="flex items-center gap-1 rounded border border-primary/20 px-2 py-1 text-[10px] text-muted-foreground transition-all hover:text-primary"
              >
                {copiedTarget ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copiedTarget ? "Copied!" : "Copy"}
              </button>
            )}
          </div>
          <div className="relative">
            <textarea
              value={targetCode}
              readOnly
              placeholder={isConverting ? "Converting..." : "Converted code will appear here..."}
              rows={16}
              className="w-full rounded border border-primary/20 bg-card p-4 font-mono text-sm text-foreground placeholder-muted-foreground outline-none resize-none"
            />
            {isConverting && (
              <div className="absolute inset-0 flex items-center justify-center rounded bg-card/75">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeConverterTool;
