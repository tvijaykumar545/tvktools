import { useState, useRef, useEffect, useCallback } from "react";
import { Download, Copy, Check, QrCode } from "lucide-react";
import QRCode from "qrcode";
import { toast } from "sonner";

interface QRCodeGeneratorProps {
  onTrackUsage: () => void;
}

const SIZE_PRESETS = [
  { label: "Small (200px)", size: 200 },
  { label: "Medium (400px)", size: 400 },
  { label: "Large (600px)", size: 600 },
  { label: "XL (800px)", size: 800 },
];

const ERROR_LEVELS: { label: string; value: "L" | "M" | "Q" | "H" }[] = [
  { label: "Low (7%)", value: "L" },
  { label: "Medium (15%)", value: "M" },
  { label: "Quartile (25%)", value: "Q" },
  { label: "High (30%)", value: "H" },
];

const QRCodeGenerator = ({ onTrackUsage }: QRCodeGeneratorProps) => {
  const [text, setText] = useState("");
  const [size, setSize] = useState(400);
  const [fgColor, setFgColor] = useState("#00ffcc");
  const [bgColor, setBgColor] = useState("#0a0a1a");
  const [errorLevel, setErrorLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateQR = useCallback(async () => {
    const input = text.trim();
    if (!input) {
      setQrDataUrl(null);
      return;
    }
    try {
      const dataUrl = await QRCode.toDataURL(input, {
        width: size,
        margin: 2,
        color: { dark: fgColor, light: bgColor },
        errorCorrectionLevel: errorLevel,
      });
      setQrDataUrl(dataUrl);
      onTrackUsage();
    } catch {
      toast.error("Failed to generate QR code");
    }
  }, [text, size, fgColor, bgColor, errorLevel, onTrackUsage]);

  // Auto-generate on changes
  useEffect(() => {
    const timer = setTimeout(generateQR, 300);
    return () => clearTimeout(timer);
  }, [generateQR]);

  const handleDownload = (format: "png" | "svg") => {
    if (!text.trim()) return;

    if (format === "svg") {
      QRCode.toString(text.trim(), {
        type: "svg",
        width: size,
        margin: 2,
        color: { dark: fgColor, light: bgColor },
        errorCorrectionLevel: errorLevel,
      }).then((svg) => {
        const blob = new Blob([svg], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "qrcode.svg";
        a.click();
        URL.revokeObjectURL(url);
        toast.success("SVG downloaded!");
      });
      return;
    }

    if (qrDataUrl) {
      const a = document.createElement("a");
      a.href = qrDataUrl;
      a.download = "qrcode.png";
      a.click();
      toast.success("PNG downloaded!");
    }
  };

  const handleCopy = async () => {
    if (!qrDataUrl) return;
    try {
      const resp = await fetch(qrDataUrl);
      const blob = await resp.blob();
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setCopied(true);
      toast.success("QR code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy. Try downloading instead.");
    }
  };

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      {/* Input Side */}
      <div className="flex flex-col gap-4">
        <label className="font-heading text-xs font-semibold text-foreground uppercase tracking-wider">
          Input
        </label>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter URL, text, email, phone number, or any data..."
          rows={4}
          className="rounded border border-primary/20 bg-card p-4 font-body text-sm text-foreground placeholder-muted-foreground outline-none transition-all focus:border-primary/50 resize-none"
        />

        {/* Options */}
        <div className="space-y-3 rounded border border-primary/10 bg-card p-4">
          <p className="font-heading text-[11px] font-semibold text-primary uppercase tracking-wider">⚙️ Options</p>

          <SettingRow label="Size">
            <div className="flex gap-1.5 flex-wrap">
              {SIZE_PRESETS.map((p) => (
                <button
                  key={p.size}
                  onClick={() => setSize(p.size)}
                  className={`px-2 py-1 rounded text-[10px] border transition-all ${size === p.size ? "bg-primary text-primary-foreground border-primary" : "border-primary/20 text-muted-foreground hover:border-primary/50"}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </SettingRow>

          <SettingRow label="Error Correction">
            <div className="flex gap-1.5 flex-wrap">
              {ERROR_LEVELS.map((e) => (
                <button
                  key={e.value}
                  onClick={() => setErrorLevel(e.value)}
                  className={`px-2 py-1 rounded text-[10px] border transition-all ${errorLevel === e.value ? "bg-primary text-primary-foreground border-primary" : "border-primary/20 text-muted-foreground hover:border-primary/50"}`}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </SettingRow>

          <SettingRow label="Colors">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-[10px] text-muted-foreground">FG</label>
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="h-7 w-10 cursor-pointer rounded border border-primary/20 bg-transparent"
                />
                <span className="text-[10px] text-muted-foreground font-mono">{fgColor}</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[10px] text-muted-foreground">BG</label>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-7 w-10 cursor-pointer rounded border border-primary/20 bg-transparent"
                />
                <span className="text-[10px] text-muted-foreground font-mono">{bgColor}</span>
              </div>
            </div>
          </SettingRow>

          <button
            onClick={() => { setFgColor("#00ffcc"); setBgColor("#0a0a1a"); setSize(400); setErrorLevel("M"); }}
            className="text-[10px] text-muted-foreground hover:text-primary transition-colors"
          >
            ↺ Reset Defaults
          </button>
        </div>

        <button
          onClick={generateQR}
          disabled={!text.trim()}
          className="flex items-center justify-center gap-2 rounded bg-primary px-6 py-3 font-heading text-xs font-bold text-primary-foreground transition-all hover:bg-primary/90 neon-glow disabled:opacity-50"
        >
          <QrCode className="h-4 w-4" /> Generate QR Code
        </button>
      </div>

      {/* Output Side */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="font-heading text-xs font-semibold text-foreground uppercase tracking-wider">
            Output
          </label>
          {qrDataUrl && (
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 rounded border border-primary/20 px-2 py-1 text-[10px] text-muted-foreground transition-all hover:text-primary"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={() => handleDownload("png")}
                className="flex items-center gap-1 rounded border border-primary/20 px-2 py-1 text-[10px] text-muted-foreground transition-all hover:text-primary"
              >
                <Download className="h-3 w-3" /> PNG
              </button>
              <button
                onClick={() => handleDownload("svg")}
                className="flex items-center gap-1 rounded border border-primary/20 px-2 py-1 text-[10px] text-muted-foreground transition-all hover:text-primary"
              >
                <Download className="h-3 w-3" /> SVG
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 min-h-[300px] overflow-auto rounded border border-primary/20 bg-card p-4 flex items-center justify-center">
          {qrDataUrl ? (
            <div className="flex flex-col items-center gap-4">
              <img
                src={qrDataUrl}
                alt="Generated QR Code"
                className="rounded-lg border border-primary/10 shadow-lg"
                style={{ maxWidth: "100%", width: Math.min(size, 500) }}
              />
              <p className="text-[10px] text-muted-foreground">
                {size}×{size}px • Error correction: {errorLevel} • {text.length} chars
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <QrCode className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm">Enter text or URL to generate a QR code</p>
            </div>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

const SettingRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-[11px] text-muted-foreground font-medium">{label}</label>
    {children}
  </div>
);

export default QRCodeGenerator;
