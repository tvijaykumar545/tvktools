import { useState, useRef, useCallback, useMemo } from "react";
import { Upload, Download, Loader2, ImageIcon, RotateCw, FlipHorizontal, FlipVertical, Sun, Contrast, Droplets, Undo2, Redo2 } from "lucide-react";
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

type AspectPreset = { label: string; w: number; h: number };
const ASPECT_PRESETS: AspectPreset[] = [
  { label: "Custom", w: 0, h: 0 },
  { label: "1:1 Square", w: 1, h: 1 },
  { label: "4:3", w: 4, h: 3 },
  { label: "16:9", w: 16, h: 9 },
  { label: "3:2", w: 3, h: 2 },
  { label: "9:16 Story", w: 9, h: 16 },
];

const RESIZE_PRESETS = [
  { label: "Custom", w: 0, h: 0 },
  { label: "HD (1280×720)", w: 1280, h: 720 },
  { label: "Full HD (1920×1080)", w: 1920, h: 1080 },
  { label: "Instagram Post (1080×1080)", w: 1080, h: 1080 },
  { label: "Instagram Story (1080×1920)", w: 1080, h: 1920 },
  { label: "Twitter Header (1500×500)", w: 1500, h: 500 },
  { label: "Facebook Cover (820×312)", w: 820, h: 312 },
  { label: "Thumbnail (300×300)", w: 300, h: 300 },
  { label: "Favicon (64×64)", w: 64, h: 64 },
];

type StudioFilter = "none" | "enhance" | "grayscale" | "sepia" | "warm" | "cool" | "high-contrast" | "vivid" | "vintage" | "dramatic";
const STUDIO_FILTERS: { id: StudioFilter; label: string; css: string }[] = [
  { id: "none", label: "Original", css: "none" },
  { id: "enhance", label: "Auto Enhance", css: "contrast(1.1) saturate(1.2) brightness(1.05)" },
  { id: "grayscale", label: "Grayscale", css: "grayscale(1)" },
  { id: "sepia", label: "Sepia", css: "sepia(0.8)" },
  { id: "warm", label: "Warm", css: "saturate(1.3) hue-rotate(-10deg) brightness(1.05)" },
  { id: "cool", label: "Cool", css: "saturate(0.9) hue-rotate(15deg) brightness(1.02)" },
  { id: "high-contrast", label: "High Contrast", css: "contrast(1.5) brightness(0.95)" },
  { id: "vivid", label: "Vivid", css: "saturate(1.8) contrast(1.1)" },
  { id: "vintage", label: "Vintage", css: "sepia(0.4) contrast(1.1) brightness(0.95) saturate(0.8)" },
  { id: "dramatic", label: "Dramatic", css: "contrast(1.4) saturate(0.7) brightness(0.9)" },
];

const ImageToolInterface = ({ toolId, toolName, onTrackUsage }: ImageToolInterfaceProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultText, setResultText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Converter/Format options
  const [format, setFormat] = useState("png");
  const [quality, setQuality] = useState(80);

  // Resize options
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [resizePreset, setResizePreset] = useState("Custom");

  // Cropper options
  const [aspectPreset, setAspectPreset] = useState("Custom");
  const [cropPosition, setCropPosition] = useState<"center" | "top-left" | "top-right" | "bottom-left" | "bottom-right">("center");

  // Mini Studio options
  const [studioFilter, setStudioFilter] = useState<StudioFilter>("enhance");
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  // Undo/Redo for Mini Studio
  type StudioState = { studioFilter: StudioFilter; brightness: number; contrast: number; saturation: number; rotation: number; flipH: boolean; flipV: boolean };
  const getStudioState = (): StudioState => ({ studioFilter, brightness, contrast, saturation, rotation, flipH, flipV });
  const [history, setHistory] = useState<StudioState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const pushHistory = useCallback(() => {
    if (toolId !== "mini-studio") return;
    const current = getStudioState();
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(current);
      return newHistory;
    });
    setHistoryIndex(prev => prev + 1);
  }, [toolId, studioFilter, brightness, contrast, saturation, rotation, flipH, flipV, historyIndex]);

  const applyState = (s: StudioState) => {
    setStudioFilter(s.studioFilter);
    setBrightness(s.brightness);
    setContrast(s.contrast);
    setSaturation(s.saturation);
    setRotation(s.rotation);
    setFlipH(s.flipH);
    setFlipV(s.flipV);
  };

  const undo = () => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    applyState(history[newIndex]);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    applyState(history[newIndex]);
  };

  const canUndo = toolId === "mini-studio" && historyIndex > 0;
  const canRedo = toolId === "mini-studio" && historyIndex < history.length - 1;

  const [compressFormat, setCompressFormat] = useState("jpeg");

  // Color picker options
  const [colorCount, setColorCount] = useState(12);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);

  // SVG options
  const [svgScale, setSvgScale] = useState("1x");

  // Base64 options
  const [base64Format, setBase64Format] = useState<"dataurl" | "raw">("dataurl");

  const [imgDimensions, setImgDimensions] = useState<{ w: number; h: number } | null>(null);

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
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      setPreview(src);
      const img = new Image();
      img.onload = () => setImgDimensions({ w: img.width, h: img.height });
      img.src = src;
    };
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
      reader.onload = (ev) => {
        const src = ev.target?.result as string;
        setPreview(src);
        const img = new Image();
        img.onload = () => setImgDimensions({ w: img.width, h: img.height });
        img.src = src;
      };
      reader.readAsDataURL(f);
    }
  }, []);

  const loadImage = (src: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  const processImage = async () => {
    if (!file || !preview) { toast.error("Please upload an image first"); return; }
    setLoading(true);
    setResultUrl(null);
    setResultText(null);
    setExtractedColors([]);

    try {
      const img = await loadImage(preview);
      const canvas = canvasRef.current || document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;

      switch (toolId) {
        case "image-converter":
        case "image-format": {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          const mimeMap: Record<string, string> = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", bmp: "image/bmp" };
          const mime = mimeMap[format] || "image/png";
          const dataUrl = canvas.toDataURL(mime, quality / 100);
          setResultUrl(dataUrl);
          const newSize = Math.round((dataUrl.length - dataUrl.indexOf(",") - 1) * 3 / 4);
          setResultText(`✅ Converted to ${format.toUpperCase()}\n\nOriginal: ${file.type} (${(file.size / 1024).toFixed(1)} KB)\nConverted: image/${format} (${(newSize / 1024).toFixed(1)} KB)\nQuality: ${quality}%\nDimensions: ${img.width} × ${img.height}`);
          break;
        }

        case "image-compressor": {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          const mime = compressFormat === "webp" ? "image/webp" : "image/jpeg";
          const dataUrl = canvas.toDataURL(mime, quality / 100);
          const origSize = file.size;
          const compressedSize = Math.round((dataUrl.length - dataUrl.indexOf(",") - 1) * 3 / 4);
          setResultUrl(dataUrl);
          setResultText(`📦 Compression Results\n\nOriginal: ${(origSize / 1024).toFixed(1)} KB\nCompressed: ${(compressedSize / 1024).toFixed(1)} KB\nFormat: ${compressFormat.toUpperCase()}\nQuality: ${quality}%\nReduction: ~${Math.max(0, Math.round((1 - compressedSize / origSize) * 100))}%`);
          break;
        }

        case "image-resizer": {
          const w = parseInt(width) || img.width;
          const h = parseInt(height) || img.height;
          canvas.width = w;
          canvas.height = h;
          ctx.drawImage(img, 0, 0, w, h);
          setResultUrl(canvas.toDataURL("image/png"));
          setResultText(`📐 Resized Successfully\n\nOriginal: ${img.width} × ${img.height}\nNew Size: ${w} × ${h}\nAspect Ratio: ${(w / h).toFixed(2)}`);
          break;
        }

        case "image-cropper": {
          let w = parseInt(width) || img.width;
          let h = parseInt(height) || img.height;
          // Apply aspect preset
          const preset = ASPECT_PRESETS.find(p => p.label === aspectPreset);
          if (preset && preset.w > 0) {
            const ratio = preset.w / preset.h;
            if (img.width / img.height > ratio) {
              h = Math.min(parseInt(height) || img.height, img.height);
              w = Math.round(h * ratio);
            } else {
              w = Math.min(parseInt(width) || img.width, img.width);
              h = Math.round(w / ratio);
            }
          } else {
            w = Math.min(w, img.width);
            h = Math.min(h, img.height);
          }
          let sx = 0, sy = 0;
          switch (cropPosition) {
            case "center": sx = (img.width - w) / 2; sy = (img.height - h) / 2; break;
            case "top-left": sx = 0; sy = 0; break;
            case "top-right": sx = img.width - w; sy = 0; break;
            case "bottom-left": sx = 0; sy = img.height - h; break;
            case "bottom-right": sx = img.width - w; sy = img.height - h; break;
          }
          sx = Math.max(0, sx); sy = Math.max(0, sy);
          canvas.width = w;
          canvas.height = h;
          ctx.drawImage(img, sx, sy, w, h, 0, 0, w, h);
          setResultUrl(canvas.toDataURL("image/png"));
          setResultText(`✂️ Cropped: ${w} × ${h}\nPosition: ${cropPosition}\n${preset && preset.w > 0 ? `Aspect: ${preset.label}` : ""}`);
          break;
        }

        case "image-base64": {
          if (base64Format === "raw") {
            const raw = preview.split(",")[1] || preview;
            setResultText(raw);
          } else {
            setResultText(preview);
          }
          break;
        }

        case "image-metadata": {
          const meta = [
            `ℹ️ Image Metadata`,
            ``,
            `📁 File Name: ${file.name}`,
            `📦 File Size: ${(file.size / 1024).toFixed(1)} KB (${file.size.toLocaleString()} bytes)`,
            `🎨 MIME Type: ${file.type}`,
            `📐 Dimensions: ${img.width} × ${img.height} px`,
            `📊 Aspect Ratio: ${(img.width / img.height).toFixed(4)} (${gcd(img.width, img.height) > 1 ? `${img.width / gcd(img.width, img.height)}:${img.height / gcd(img.width, img.height)}` : `${img.width}:${img.height}`})`,
            `🖼️ Total Pixels: ${(img.width * img.height).toLocaleString()}`,
            `📏 Megapixels: ${((img.width * img.height) / 1000000).toFixed(2)} MP`,
            `📅 Last Modified: ${new Date(file.lastModified).toLocaleString()}`,
            `🎯 Orientation: ${img.width > img.height ? "Landscape" : img.width < img.height ? "Portrait" : "Square"}`,
            `💾 Estimated Memory: ${((img.width * img.height * 4) / 1024 / 1024).toFixed(2)} MB (RGBA)`,
          ].join("\n");
          setResultText(meta);
          break;
        }

        case "svg-to-png": {
          const scale = svgScale === "2x" ? 2 : svgScale === "3x" ? 3 : svgScale === "4x" ? 4 : 1;
          const w = parseInt(width) || img.width;
          const h = parseInt(height) || img.height;
          canvas.width = w * scale;
          canvas.height = h * scale;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setResultUrl(canvas.toDataURL("image/png"));
          setResultText(`🖌️ SVG → PNG\n\nScale: ${svgScale}\nOutput: ${canvas.width} × ${canvas.height} px`);
          break;
        }

        case "color-picker": {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
          const colorMap: Record<string, number> = {};
          const step = Math.max(1, Math.floor(imageData.length / (4 * 10000)));
          for (let i = 0; i < imageData.length; i += 4 * step) {
            const r = Math.round(imageData[i] / 16) * 16;
            const g = Math.round(imageData[i + 1] / 16) * 16;
            const b = Math.round(imageData[i + 2] / 16) * 16;
            const hex = `#${clampHex(r)}${clampHex(g)}${clampHex(b)}`;
            colorMap[hex] = (colorMap[hex] || 0) + 1;
          }
          const sorted = Object.entries(colorMap).sort((a, b) => b[1] - a[1]).slice(0, colorCount).map(([hex]) => hex);
          setExtractedColors(sorted);
          setResultText(`🎯 Extracted ${sorted.length} dominant colors`);
          break;
        }

        case "mini-studio": {
          // Handle rotation
          const rad = (rotation * Math.PI) / 180;
          const sin = Math.abs(Math.sin(rad));
          const cos = Math.abs(Math.cos(rad));
          const newW = Math.round(img.width * cos + img.height * sin);
          const newH = Math.round(img.width * sin + img.height * cos);
          canvas.width = newW;
          canvas.height = newH;
          ctx.save();
          ctx.translate(newW / 2, newH / 2);
          if (flipH) ctx.scale(-1, 1);
          if (flipV) ctx.scale(1, -1);
          ctx.rotate(rad);
          // Build CSS filter
          const customFilter = `brightness(${brightness / 100}) contrast(${contrast / 100}) saturate(${saturation / 100})`;
          const selectedFilter = STUDIO_FILTERS.find(f => f.id === studioFilter);
          ctx.filter = studioFilter === "none" ? customFilter : `${selectedFilter?.css || "none"} ${customFilter}`;
          ctx.drawImage(img, -img.width / 2, -img.height / 2);
          ctx.restore();
          ctx.filter = "none";
          setResultUrl(canvas.toDataURL("image/png"));
          const appliedEffects = [];
          if (studioFilter !== "none") appliedEffects.push(`Filter: ${selectedFilter?.label}`);
          if (brightness !== 100) appliedEffects.push(`Brightness: ${brightness}%`);
          if (contrast !== 100) appliedEffects.push(`Contrast: ${contrast}%`);
          if (saturation !== 100) appliedEffects.push(`Saturation: ${saturation}%`);
          if (rotation !== 0) appliedEffects.push(`Rotation: ${rotation}°`);
          if (flipH) appliedEffects.push("Flipped Horizontally");
          if (flipV) appliedEffects.push("Flipped Vertically");
          setResultText(`🎬 Studio Edit Applied\n\n${appliedEffects.join("\n") || "No effects applied"}`);
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
    a.download = `${toolId}-result.${format || "png"}`;
    a.click();
  };

  const handleCopyText = () => {
    if (resultText) { navigator.clipboard.writeText(resultText); toast.success("Copied to clipboard!"); }
  };

  const handleResizePreset = (label: string) => {
    setResizePreset(label);
    const preset = RESIZE_PRESETS.find(p => p.label === label);
    if (preset && preset.w > 0) { setWidth(String(preset.w)); setHeight(String(preset.h)); }
  };

  const handleWidthChange = (val: string) => {
    setWidth(val);
    setResizePreset("Custom");
    if (maintainAspect && imgDimensions && val) {
      const ratio = imgDimensions.h / imgDimensions.w;
      setHeight(String(Math.round(parseInt(val) * ratio)));
    }
  };

  const handleHeightChange = (val: string) => {
    setHeight(val);
    setResizePreset("Custom");
    if (maintainAspect && imgDimensions && val) {
      const ratio = imgDimensions.w / imgDimensions.h;
      setWidth(String(Math.round(parseInt(val) * ratio)));
    }
  };

  // ── Settings Panel per tool ─────────────────────────────────
  const renderSettings = () => {
    const disabled = !file;

    return (
      <div className={`space-y-3 rounded border border-primary/10 bg-card p-4 ${disabled ? "opacity-60 pointer-events-none" : ""}`}>
        <p className="font-heading text-[11px] font-semibold text-primary uppercase tracking-wider">⚙️ Options</p>

        {/* ── Converter / Format ── */}
        {(toolId === "image-converter" || toolId === "image-format") && (
          <>
            <SettingRow label="Output Format">
              <div className="flex gap-1.5 flex-wrap">
                {["png", "jpg", "webp", "bmp"].map(f => (
                  <button key={f} onClick={() => setFormat(f)}
                    className={`px-3 py-1 rounded text-[11px] font-heading uppercase transition-all border ${format === f ? "bg-primary text-primary-foreground border-primary" : "border-primary/20 text-muted-foreground hover:border-primary/50"}`}>
                    {f}
                  </button>
                ))}
              </div>
            </SettingRow>
            <SettingRow label={`Quality: ${quality}%`}>
              <input type="range" min={10} max={100} value={quality} onChange={e => setQuality(Number(e.target.value))} className="w-full accent-primary" />
            </SettingRow>
          </>
        )}

        {/* ── Compressor ── */}
        {toolId === "image-compressor" && (
          <>
            <SettingRow label="Compress Format">
              <div className="flex gap-1.5">
                {["jpeg", "webp"].map(f => (
                  <button key={f} onClick={() => setCompressFormat(f)}
                    className={`px-3 py-1 rounded text-[11px] font-heading uppercase transition-all border ${compressFormat === f ? "bg-primary text-primary-foreground border-primary" : "border-primary/20 text-muted-foreground hover:border-primary/50"}`}>
                    {f}
                  </button>
                ))}
              </div>
            </SettingRow>
            <SettingRow label={`Quality: ${quality}%`}>
              <input type="range" min={10} max={100} value={quality} onChange={e => setQuality(Number(e.target.value))} className="w-full accent-primary" />
            </SettingRow>
            <p className="text-[10px] text-muted-foreground/60">Lower quality = smaller file size. 60-80% recommended.</p>
          </>
        )}

        {/* ── Resizer ── */}
        {toolId === "image-resizer" && (
          <>
            <SettingRow label="Size Presets">
              <select value={resizePreset} onChange={e => handleResizePreset(e.target.value)}
                className="w-full rounded border border-primary/20 bg-background px-2 py-1.5 text-xs text-foreground">
                {RESIZE_PRESETS.map(p => <option key={p.label} value={p.label}>{p.label}</option>)}
              </select>
            </SettingRow>
            <SettingRow label="Dimensions">
              <div className="flex items-center gap-2">
                <input type="number" placeholder="Width" value={width} onChange={e => handleWidthChange(e.target.value)}
                  className="w-20 rounded border border-primary/20 bg-background px-2 py-1 text-xs text-foreground" />
                <span className="text-xs text-muted-foreground">×</span>
                <input type="number" placeholder="Height" value={height} onChange={e => handleHeightChange(e.target.value)}
                  className="w-20 rounded border border-primary/20 bg-background px-2 py-1 text-xs text-foreground" />
                <span className="text-[10px] text-muted-foreground">px</span>
              </div>
            </SettingRow>
            <SettingRow label="Maintain Aspect Ratio">
              <button onClick={() => setMaintainAspect(!maintainAspect)}
                className={`px-3 py-1 rounded text-[11px] border transition-all ${maintainAspect ? "bg-primary text-primary-foreground border-primary" : "border-primary/20 text-muted-foreground"}`}>
                {maintainAspect ? "🔗 Locked" : "🔓 Unlocked"}
              </button>
            </SettingRow>
            {imgDimensions && <p className="text-[10px] text-muted-foreground/60">Original: {imgDimensions.w} × {imgDimensions.h} px</p>}
          </>
        )}

        {/* ── Cropper ── */}
        {toolId === "image-cropper" && (
          <>
            <SettingRow label="Aspect Ratio">
              <div className="flex gap-1.5 flex-wrap">
                {ASPECT_PRESETS.map(p => (
                  <button key={p.label} onClick={() => setAspectPreset(p.label)}
                    className={`px-2 py-1 rounded text-[10px] border transition-all ${aspectPreset === p.label ? "bg-primary text-primary-foreground border-primary" : "border-primary/20 text-muted-foreground hover:border-primary/50"}`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </SettingRow>
            {aspectPreset === "Custom" && (
              <SettingRow label="Crop Size">
                <div className="flex items-center gap-2">
                  <input type="number" placeholder="Width" value={width} onChange={e => setWidth(e.target.value)}
                    className="w-20 rounded border border-primary/20 bg-background px-2 py-1 text-xs text-foreground" />
                  <span className="text-xs text-muted-foreground">×</span>
                  <input type="number" placeholder="Height" value={height} onChange={e => setHeight(e.target.value)}
                    className="w-20 rounded border border-primary/20 bg-background px-2 py-1 text-xs text-foreground" />
                </div>
              </SettingRow>
            )}
            <SettingRow label="Crop Position">
              <div className="flex gap-1.5 flex-wrap">
                {(["center", "top-left", "top-right", "bottom-left", "bottom-right"] as const).map(pos => (
                  <button key={pos} onClick={() => setCropPosition(pos)}
                    className={`px-2 py-1 rounded text-[10px] capitalize border transition-all ${cropPosition === pos ? "bg-primary text-primary-foreground border-primary" : "border-primary/20 text-muted-foreground hover:border-primary/50"}`}>
                    {pos}
                  </button>
                ))}
              </div>
            </SettingRow>
          </>
        )}

        {/* ── Mini Studio ── */}
        {toolId === "mini-studio" && (
          <>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-muted-foreground">History</span>
              <div className="flex gap-1">
                <button onClick={undo} disabled={!canUndo} title="Undo"
                  className="flex items-center gap-1 px-2 py-1 rounded text-[10px] border border-primary/20 text-muted-foreground hover:border-primary/50 hover:text-primary transition-all disabled:opacity-30 disabled:pointer-events-none">
                  <Undo2 className="h-3 w-3" /> Undo
                </button>
                <button onClick={redo} disabled={!canRedo} title="Redo"
                  className="flex items-center gap-1 px-2 py-1 rounded text-[10px] border border-primary/20 text-muted-foreground hover:border-primary/50 hover:text-primary transition-all disabled:opacity-30 disabled:pointer-events-none">
                  <Redo2 className="h-3 w-3" /> Redo
                </button>
              </div>
            </div>
            <SettingRow label="Filters">
              <div className="grid grid-cols-3 gap-1.5">
                {STUDIO_FILTERS.map(f => (
                  <button key={f.id} onClick={() => { pushHistory(); setStudioFilter(f.id); }}
                    className={`px-2 py-1.5 rounded text-[10px] border transition-all ${studioFilter === f.id ? "bg-primary text-primary-foreground border-primary" : "border-primary/20 text-muted-foreground hover:border-primary/50"}`}>
                    {f.label}
                  </button>
                ))}
              </div>
            </SettingRow>
            <SettingRow label={`Brightness: ${brightness}%`}>
              <input type="range" min={20} max={200} value={brightness} onMouseDown={pushHistory} onTouchStart={pushHistory} onChange={e => setBrightness(Number(e.target.value))} className="w-full accent-primary" />
            </SettingRow>
            <SettingRow label={`Contrast: ${contrast}%`}>
              <input type="range" min={20} max={200} value={contrast} onMouseDown={pushHistory} onTouchStart={pushHistory} onChange={e => setContrast(Number(e.target.value))} className="w-full accent-primary" />
            </SettingRow>
            <SettingRow label={`Saturation: ${saturation}%`}>
              <input type="range" min={0} max={300} value={saturation} onMouseDown={pushHistory} onTouchStart={pushHistory} onChange={e => setSaturation(Number(e.target.value))} className="w-full accent-primary" />
            </SettingRow>
            <SettingRow label="Transform">
              <div className="flex gap-2">
                <button onClick={() => { pushHistory(); setRotation((rotation + 90) % 360); }} title="Rotate 90°"
                  className="flex items-center gap-1 px-2 py-1 rounded text-[10px] border border-primary/20 text-muted-foreground hover:border-primary/50 hover:text-primary transition-all">
                  <RotateCw className="h-3 w-3" /> {rotation}°
                </button>
                <button onClick={() => { pushHistory(); setFlipH(!flipH); }} title="Flip Horizontal"
                  className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] border transition-all ${flipH ? "bg-primary text-primary-foreground border-primary" : "border-primary/20 text-muted-foreground hover:border-primary/50"}`}>
                  <FlipHorizontal className="h-3 w-3" /> H
                </button>
                <button onClick={() => { pushHistory(); setFlipV(!flipV); }} title="Flip Vertical"
                  className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] border transition-all ${flipV ? "bg-primary text-primary-foreground border-primary" : "border-primary/20 text-muted-foreground hover:border-primary/50"}`}>
                  <FlipVertical className="h-3 w-3" /> V
                </button>
              </div>
            </SettingRow>
            <button onClick={() => { pushHistory(); setBrightness(100); setContrast(100); setSaturation(100); setRotation(0); setFlipH(false); setFlipV(false); setStudioFilter("none"); }}
              className="text-[10px] text-muted-foreground hover:text-primary transition-colors">↺ Reset All</button>
          </>
        )}

        {/* ── SVG to PNG ── */}
        {toolId === "svg-to-png" && (
          <>
            <SettingRow label="Scale">
              <div className="flex gap-1.5">
                {["1x", "2x", "3x", "4x"].map(s => (
                  <button key={s} onClick={() => setSvgScale(s)}
                    className={`px-3 py-1 rounded text-[11px] border transition-all ${svgScale === s ? "bg-primary text-primary-foreground border-primary" : "border-primary/20 text-muted-foreground hover:border-primary/50"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </SettingRow>
            <SettingRow label="Custom Size (optional)">
              <div className="flex items-center gap-2">
                <input type="number" placeholder="Width" value={width} onChange={e => setWidth(e.target.value)}
                  className="w-20 rounded border border-primary/20 bg-background px-2 py-1 text-xs text-foreground" />
                <span className="text-xs text-muted-foreground">×</span>
                <input type="number" placeholder="Height" value={height} onChange={e => setHeight(e.target.value)}
                  className="w-20 rounded border border-primary/20 bg-background px-2 py-1 text-xs text-foreground" />
              </div>
            </SettingRow>
          </>
        )}

        {/* ── Color Picker ── */}
        {toolId === "color-picker" && (
          <SettingRow label={`Number of Colors: ${colorCount}`}>
            <input type="range" min={4} max={24} value={colorCount} onChange={e => setColorCount(Number(e.target.value))} className="w-full accent-primary" />
          </SettingRow>
        )}

        {/* ── Base64 ── */}
        {toolId === "image-base64" && (
          <SettingRow label="Output Format">
            <div className="flex gap-1.5">
              {[{ id: "dataurl" as const, label: "Data URL" }, { id: "raw" as const, label: "Raw Base64" }].map(f => (
                <button key={f.id} onClick={() => setBase64Format(f.id)}
                  className={`px-3 py-1 rounded text-[11px] border transition-all ${base64Format === f.id ? "bg-primary text-primary-foreground border-primary" : "border-primary/20 text-muted-foreground hover:border-primary/50"}`}>
                  {f.label}
                </button>
              ))}
            </div>
          </SettingRow>
        )}

        {/* ── Metadata (no extra settings) ── */}
        {toolId === "image-metadata" && (
          <p className="text-[10px] text-muted-foreground/60">Upload an image to view its complete metadata information.</p>
        )}
      </div>
    );
  };

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      {/* Input Side */}
      <div className="flex flex-col gap-3">
        <label className="font-heading text-xs font-semibold text-foreground uppercase tracking-wider">Upload Image</label>

        <div onDrop={handleDrop} onDragOver={e => e.preventDefault()} onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center min-h-[180px] rounded border-2 border-dashed border-primary/30 bg-card p-6 cursor-pointer transition-all hover:border-primary/60 hover:bg-primary/5">
          {preview ? (
            <img src={preview} alt="Preview" className="max-h-[220px] max-w-full rounded object-contain" />
          ) : (
            <>
              <Upload className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Click or drag & drop an image</p>
              <p className="text-xs text-muted-foreground/60 mt-1">PNG, JPG, WebP, SVG, BMP</p>
            </>
          )}
        </div>

        <input ref={fileInputRef} type="file" accept="image/*,.svg" onChange={handleFileSelect} className="hidden" />

        {file && (
          <p className="text-xs text-muted-foreground">
            📁 {file.name} ({(file.size / 1024).toFixed(1)} KB){imgDimensions ? ` • ${imgDimensions.w}×${imgDimensions.h}` : ""}
          </p>
        )}

        {renderSettings()}

        <button onClick={processImage} disabled={loading || !file}
          className="flex items-center justify-center gap-2 rounded bg-primary px-6 py-3 font-heading text-xs font-bold text-primary-foreground transition-all hover:bg-primary/90 neon-glow disabled:opacity-50">
          {loading ? (<><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>) : (<><ImageIcon className="h-4 w-4" /> Process Image</>)}
        </button>
      </div>

      {/* Output Side */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="font-heading text-xs font-semibold text-foreground uppercase tracking-wider">Output</label>
          <div className="flex gap-2">
            {resultUrl && (
              <button onClick={handleDownloadResult} className="flex items-center gap-1 rounded border border-primary/20 px-2 py-1 text-[10px] text-muted-foreground transition-all hover:text-primary">
                <Download className="h-3 w-3" /> Download
              </button>
            )}
            {resultText && (toolId === "image-base64" || toolId === "image-metadata") && (
              <button onClick={handleCopyText} className="flex items-center gap-1 rounded border border-primary/20 px-2 py-1 text-[10px] text-muted-foreground transition-all hover:text-primary">
                📋 Copy
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 min-h-[300px] overflow-auto rounded border border-primary/20 bg-card p-4">
          {resultUrl ? (
            <div className="flex flex-col items-center gap-4">
              <img src={resultUrl} alt="Result" className="max-w-full rounded-lg border border-primary/10 shadow-lg" />
              {resultText && <pre className="w-full text-xs text-muted-foreground whitespace-pre-wrap">{resultText}</pre>}
            </div>
          ) : resultText ? (
            <pre className="text-sm text-foreground whitespace-pre-wrap break-all">{resultText}</pre>
          ) : extractedColors.length > 0 ? null : (
            <div className="flex flex-col items-center justify-center h-full min-h-[250px] text-muted-foreground">
              <ImageIcon className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm">Processed image will appear here...</p>
            </div>
          )}

          {extractedColors.length > 0 && (
            <div className="space-y-4">
              {resultText && <p className="text-sm text-foreground">{resultText}</p>}
              <div className="grid grid-cols-4 gap-3">
                {extractedColors.map((color, i) => (
                  <button key={i} onClick={() => { navigator.clipboard.writeText(color); toast.success(`Copied ${color}`); }}
                    className="group flex flex-col items-center gap-1">
                    <div className="w-full aspect-square rounded-lg border border-primary/20 transition-transform group-hover:scale-105 shadow-md" style={{ backgroundColor: color }} />
                    <span className="text-[10px] text-muted-foreground font-mono group-hover:text-primary transition-colors">{color}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

// ── Helpers ──────────────────────────────────
const SettingRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-[11px] text-muted-foreground font-medium">{label}</label>
    {children}
  </div>
);

function gcd(a: number, b: number): number { return b === 0 ? a : gcd(b, a % b); }
function clampHex(n: number) { return Math.min(255, Math.max(0, n)).toString(16).padStart(2, "0"); }

export default ImageToolInterface;
