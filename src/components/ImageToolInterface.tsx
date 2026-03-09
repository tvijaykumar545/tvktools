import { useState, useRef, useCallback } from "react";
import { Upload, Download, Loader2, ImageIcon, RotateCcw, Crop, Palette } from "lucide-react";
import { toast } from "sonner";

interface ImageToolInterfaceProps {
  toolId: string;
  toolName: string;
  onTrackUsage: () => void;
}

const IMAGE_TOOL_IDS = [
  "image-converter", "image-compressor", "image-resizer", "image-base64",
  "image-metadata", "image-cropper", "image-format", "mini-studio",
  "svg-to-png", "color-picker",
];

export const isImageTool = (toolId: string) => IMAGE_TOOL_IDS.includes(toolId);

const ImageToolInterface = ({ toolId, toolName, onTrackUsage }: ImageToolInterfaceProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultText, setResultText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [format, setFormat] = useState("png");
  const [quality, setQuality] = useState(80);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/") && !f.type.includes("svg")) {
      toast.error("Please upload a valid image file");
      return;
    }
    setFile(f);
    setResultUrl(null);
    setResultText(null);
    setExtractedColors([]);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && (f.type.startsWith("image/") || f.type.includes("svg"))) {
      setFile(f);
      setResultUrl(null);
      setResultText(null);
      setExtractedColors([]);
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(f);
    }
  }, []);

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const processImage = async () => {
    if (!file || !preview) {
      toast.error("Please upload an image first");
      return;
    }
    setLoading(true);
    setResultUrl(null);
    setResultText(null);

    try {
      const img = await loadImage(preview);
      const canvas = canvasRef.current || document.createElement("canvas");

      switch (toolId) {
        case "image-converter":
        case "image-format": {
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0);
          const mimeMap: Record<string, string> = {
            png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg",
            webp: "image/webp", bmp: "image/bmp",
          };
          const mime = mimeMap[format] || "image/png";
          const dataUrl = canvas.toDataURL(mime, quality / 100);
          setResultUrl(dataUrl);
          break;
        }

        case "image-compressor": {
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL("image/jpeg", quality / 100);
          const origSize = file.size;
          const compressedSize = Math.round((dataUrl.length * 3) / 4);
          setResultUrl(dataUrl);
          setResultText(
            `📦 Compression Results\n\nOriginal: ${(origSize / 1024).toFixed(1)} KB\nCompressed: ${(compressedSize / 1024).toFixed(1)} KB\nQuality: ${quality}%\nReduction: ~${Math.max(0, Math.round((1 - compressedSize / origSize) * 100))}%`
          );
          break;
        }

        case "image-resizer": {
          const w = parseInt(width) || img.width;
          const h = parseInt(height) || img.height;
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0, w, h);
          setResultUrl(canvas.toDataURL("image/png"));
          setResultText(`📐 Resized: ${img.width}×${img.height} → ${w}×${h}`);
          break;
        }

        case "image-cropper": {
          const w = Math.min(parseInt(width) || img.width, img.width);
          const h = Math.min(parseInt(height) || img.height, img.height);
          const sx = Math.max(0, (img.width - w) / 2);
          const sy = Math.max(0, (img.height - h) / 2);
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, sx, sy, w, h, 0, 0, w, h);
          setResultUrl(canvas.toDataURL("image/png"));
          setResultText(`✂️ Cropped from center: ${w}×${h}`);
          break;
        }

        case "image-base64": {
          setResultText(preview);
          break;
        }

        case "image-metadata": {
          const meta = [
            `ℹ️ Image Metadata`,
            ``,
            `📁 File: ${file.name}`,
            `📦 Size: ${(file.size / 1024).toFixed(1)} KB`,
            `🎨 Type: ${file.type}`,
            `📐 Dimensions: ${img.width} × ${img.height} px`,
            `📊 Aspect Ratio: ${(img.width / img.height).toFixed(2)}`,
            `📅 Last Modified: ${new Date(file.lastModified).toLocaleString()}`,
            `🖼️ Total Pixels: ${(img.width * img.height).toLocaleString()}`,
          ].join("\n");
          setResultText(meta);
          break;
        }

        case "svg-to-png": {
          canvas.width = parseInt(width) || img.width || 512;
          canvas.height = parseInt(height) || img.height || 512;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setResultUrl(canvas.toDataURL("image/png"));
          setResultText(`🖌️ SVG converted to PNG (${canvas.width}×${canvas.height})`);
          break;
        }

        case "color-picker": {
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
          const colorMap: Record<string, number> = {};
          const step = Math.max(1, Math.floor(imageData.length / (4 * 5000)));
          for (let i = 0; i < imageData.length; i += 4 * step) {
            const r = Math.round(imageData[i] / 32) * 32;
            const g = Math.round(imageData[i + 1] / 32) * 32;
            const b = Math.round(imageData[i + 2] / 32) * 32;
            const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
            colorMap[hex] = (colorMap[hex] || 0) + 1;
          }
          const sorted = Object.entries(colorMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 12)
            .map(([hex]) => hex);
          setExtractedColors(sorted);
          setResultText(`🎯 Extracted ${sorted.length} dominant colors from the image`);
          break;
        }

        case "mini-studio": {
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d")!;
          // Apply a brightness/contrast enhancement
          ctx.filter = "contrast(1.1) saturate(1.2) brightness(1.05)";
          ctx.drawImage(img, 0, 0);
          ctx.filter = "none";
          setResultUrl(canvas.toDataURL("image/png"));
          setResultText("🎬 Applied studio enhancement (contrast +10%, saturation +20%, brightness +5%)");
          break;
        }

        default:
          setResultText("This image tool is not yet implemented.");
      }

      onTrackUsage();
    } catch (err) {
      toast.error("Failed to process image. Please try a different file.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadResult = () => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    const ext = format || "png";
    a.download = `${toolId}-result.${ext}`;
    a.click();
  };

  const handleCopyBase64 = () => {
    if (resultText) {
      navigator.clipboard.writeText(resultText);
      toast.success("Copied to clipboard!");
    }
  };

  const showFormatSelect = ["image-converter", "image-format"].includes(toolId);
  const showQualitySlider = ["image-compressor", "image-converter", "image-format"].includes(toolId);
  const showDimensions = ["image-resizer", "image-cropper", "svg-to-png"].includes(toolId);

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      {/* Input Side */}
      <div className="flex flex-col gap-3">
        <label className="font-heading text-xs font-semibold text-foreground uppercase tracking-wider">
          Upload Image
        </label>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center min-h-[200px] rounded border-2 border-dashed border-primary/30 bg-card p-6 cursor-pointer transition-all hover:border-primary/60 hover:bg-primary/5"
        >
          {preview ? (
            <img src={preview} alt="Preview" className="max-h-[250px] max-w-full rounded object-contain" />
          ) : (
            <>
              <Upload className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Click or drag & drop an image here</p>
              <p className="text-xs text-muted-foreground/60 mt-1">PNG, JPG, WebP, SVG supported</p>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.svg"
          onChange={handleFileSelect}
          className="hidden"
        />

        {file && (
          <p className="text-xs text-muted-foreground">
            📁 {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </p>
        )}

        {/* Settings */}
        {file && (
          <div className="space-y-3 rounded border border-primary/10 bg-card p-3">
            <p className="font-heading text-xs font-semibold text-foreground uppercase tracking-wider">Settings</p>

            {showFormatSelect && (
              <div className="flex items-center gap-3">
                <label className="text-xs text-muted-foreground min-w-[60px]">Format:</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="flex-1 rounded border border-primary/20 bg-background px-2 py-1 text-xs text-foreground"
                >
                  <option value="png">PNG</option>
                  <option value="jpg">JPG</option>
                  <option value="webp">WebP</option>
                  <option value="bmp">BMP</option>
                </select>
              </div>
            )}

            {showQualitySlider && (
              <div className="flex items-center gap-3">
                <label className="text-xs text-muted-foreground min-w-[60px]">Quality:</label>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="flex-1 accent-primary"
                />
                <span className="text-xs text-foreground w-8 text-right">{quality}%</span>
              </div>
            )}

            {showDimensions && (
              <div className="flex items-center gap-3">
                <label className="text-xs text-muted-foreground min-w-[60px]">Size:</label>
                <input
                  type="number"
                  placeholder="Width"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className="w-20 rounded border border-primary/20 bg-background px-2 py-1 text-xs text-foreground"
                />
                <span className="text-xs text-muted-foreground">×</span>
                <input
                  type="number"
                  placeholder="Height"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-20 rounded border border-primary/20 bg-background px-2 py-1 text-xs text-foreground"
                />
                <span className="text-xs text-muted-foreground">px</span>
              </div>
            )}
          </div>
        )}

        <button
          onClick={processImage}
          disabled={loading || !file}
          className="flex items-center justify-center gap-2 rounded bg-primary px-6 py-3 font-heading text-xs font-bold text-primary-foreground transition-all hover:bg-primary/90 neon-glow disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Processing...
            </>
          ) : (
            <>
              <ImageIcon className="h-4 w-4" /> Process Image
            </>
          )}
        </button>
      </div>

      {/* Output Side */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="font-heading text-xs font-semibold text-foreground uppercase tracking-wider">
            Output
          </label>
          <div className="flex gap-2">
            {resultUrl && (
              <button
                onClick={handleDownloadResult}
                className="flex items-center gap-1 rounded border border-primary/20 px-2 py-1 text-[10px] text-muted-foreground transition-all hover:text-primary"
              >
                <Download className="h-3 w-3" /> Download
              </button>
            )}
            {resultText && toolId === "image-base64" && (
              <button
                onClick={handleCopyBase64}
                className="flex items-center gap-1 rounded border border-primary/20 px-2 py-1 text-[10px] text-muted-foreground transition-all hover:text-primary"
              >
                📋 Copy Base64
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 min-h-[300px] overflow-auto rounded border border-primary/20 bg-card p-4">
          {resultUrl ? (
            <div className="flex flex-col items-center gap-4">
              <img src={resultUrl} alt="Result" className="max-w-full rounded-lg border border-primary/10 shadow-lg" />
              {resultText && (
                <pre className="w-full text-xs text-muted-foreground whitespace-pre-wrap">{resultText}</pre>
              )}
            </div>
          ) : resultText ? (
            <pre className="text-sm text-foreground whitespace-pre-wrap break-all">{resultText}</pre>
          ) : extractedColors.length > 0 ? null : (
            <div className="flex flex-col items-center justify-center h-full min-h-[250px] text-muted-foreground">
              <ImageIcon className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm">Processed image will appear here...</p>
            </div>
          )}

          {/* Color picker results */}
          {extractedColors.length > 0 && (
            <div className="space-y-4">
              {resultText && <p className="text-sm text-foreground">{resultText}</p>}
              <div className="grid grid-cols-4 gap-3">
                {extractedColors.map((color, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      navigator.clipboard.writeText(color);
                      toast.success(`Copied ${color}`);
                    }}
                    className="group flex flex-col items-center gap-1"
                  >
                    <div
                      className="w-full aspect-square rounded-lg border border-primary/20 transition-transform group-hover:scale-105 shadow-md"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-[10px] text-muted-foreground font-mono group-hover:text-primary transition-colors">
                      {color}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ImageToolInterface;
