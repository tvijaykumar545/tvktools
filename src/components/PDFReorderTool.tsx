// @ts-nocheck
import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, Download, Loader2, FileText, GripVertical, ArrowUp, ArrowDown, RotateCcw } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { toast } from "sonner";

interface PDFReorderToolProps {
  onTrackUsage: () => void;
}

interface PageThumb {
  index: number;       // original page index
  label: string;       // display label
  dataUrl: string;     // thumbnail image
}

const PDFReorderTool = ({ onTrackUsage }: PDFReorderToolProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [pages, setPages] = useState<PageThumb[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setResultUrl(null);
    setLoading(true);

    try {
      const buffer = await selected.arrayBuffer();
      setPdfBytes(buffer);
      await generateThumbnails(buffer);
    } catch (err) {
      toast.error("Failed to load PDF");
    } finally {
      setLoading(false);
    }
    e.target.value = "";
  }, []);

  const generateThumbnails = async (buffer: ArrayBuffer) => {
    const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const pageCount = pdfDoc.getPageCount();
    const thumbs: PageThumb[] = [];

    for (let i = 0; i < pageCount; i++) {
      // Create a single-page PDF for each page and render as a simple colored thumbnail
      const page = pdfDoc.getPage(i);
      const { width, height } = page.getSize();
      const aspect = width / height;
      const thumbW = 120;
      const thumbH = thumbW / aspect;

      // Create a simple thumbnail with page number (since we can't render PDF in canvas without pdf.js)
      const canvas = document.createElement("canvas");
      canvas.width = thumbW;
      canvas.height = thumbH;
      const ctx = canvas.getContext("2d")!;

      // Background
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(0, 0, thumbW, thumbH);

      // Border
      ctx.strokeStyle = "#00ffcc";
      ctx.lineWidth = 1;
      ctx.strokeRect(1, 1, thumbW - 2, thumbH - 2);

      // Simulated content lines
      ctx.fillStyle = "#333355";
      const lineCount = Math.min(8, Math.floor(thumbH / 12));
      for (let l = 0; l < lineCount; l++) {
        const lw = 20 + Math.random() * (thumbW - 40);
        ctx.fillRect(10, 15 + l * 12, lw, 4);
      }

      // Page number
      ctx.fillStyle = "#00ffcc";
      ctx.font = "bold 20px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${i + 1}`, thumbW / 2, thumbH / 2);

      // Size label
      ctx.fillStyle = "#666";
      ctx.font = "8px sans-serif";
      ctx.fillText(`${Math.round(width)}×${Math.round(height)}`, thumbW / 2, thumbH - 8);

      thumbs.push({
        index: i,
        label: `Page ${i + 1}`,
        dataUrl: canvas.toDataURL(),
      });
    }

    setPages(thumbs);
    toast.success(`Loaded ${pageCount} pages`);
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (!dropped || !dropped.name.toLowerCase().endsWith(".pdf")) return;
    setFile(dropped);
    setResultUrl(null);
    setLoading(true);
    try {
      const buffer = await dropped.arrayBuffer();
      setPdfBytes(buffer);
      await generateThumbnails(buffer);
    } catch {
      toast.error("Failed to load PDF");
    } finally {
      setLoading(false);
    }
  }, []);

  // Drag and drop reorder handlers
  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (dragIndex !== null && dragOverIndex !== null && dragIndex !== dragOverIndex) {
      const newPages = [...pages];
      const [moved] = newPages.splice(dragIndex, 1);
      newPages.splice(dragOverIndex, 0, moved);
      setPages(newPages);
      setResultUrl(null);
    }
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newPages = [...pages];
    [newPages[index - 1], newPages[index]] = [newPages[index], newPages[index - 1]];
    setPages(newPages);
    setResultUrl(null);
  };

  const moveDown = (index: number) => {
    if (index === pages.length - 1) return;
    const newPages = [...pages];
    [newPages[index], newPages[index + 1]] = [newPages[index + 1], newPages[index]];
    setPages(newPages);
    setResultUrl(null);
  };

  const resetOrder = () => {
    const sorted = [...pages].sort((a, b) => a.index - b.index);
    setPages(sorted);
    setResultUrl(null);
    toast.info("Page order reset to original");
  };

  const buildReorderedPdf = async () => {
    if (!pdfBytes || pages.length === 0) return;
    setGenerating(true);

    try {
      const src = await PDFDocument.load(pdfBytes);
      const newPdf = await PDFDocument.create();
      const newOrder = pages.map(p => p.index);
      const copiedPages = await newPdf.copyPages(src, newOrder);
      copiedPages.forEach(p => newPdf.addPage(p));

      const bytes = await newPdf.save();
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      onTrackUsage();
      toast.success("Reordered PDF ready for download!");
    } catch (err) {
      toast.error("Failed to reorder PDF");
    } finally {
      setGenerating(false);
    }
  };

  const isReordered = pages.some((p, i) => p.index !== pages.sort ? false : true) &&
    pages.length > 0 && pages.some((p, i, arr) => i > 0 && p.index < arr[i - 1].index);

  return (
    <div className="mt-8 space-y-6">
      {/* Upload area */}
      {pages.length === 0 && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          className="flex flex-col items-center justify-center min-h-[250px] rounded border-2 border-dashed border-primary/30 bg-card p-8 cursor-pointer transition-all hover:border-primary/60 hover:bg-primary/5"
        >
          {loading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Loading PDF pages...</p>
            </div>
          ) : (
            <>
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground font-medium">Click or drag & drop a PDF file</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Upload a PDF to rearrange its pages</p>
            </>
          )}
        </div>
      )}

      <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />

      {/* Page thumbnails grid */}
      {pages.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <label className="font-heading text-xs font-semibold text-foreground uppercase tracking-wider">
                Drag to Reorder ({pages.length} pages)
              </label>
              {file && (
                <span className="text-[10px] text-muted-foreground">📁 {file.name}</span>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={resetOrder}
                className="flex items-center gap-1 rounded border border-primary/20 px-2 py-1 text-[10px] text-muted-foreground transition-all hover:text-primary hover:border-primary/40">
                <RotateCcw className="h-3 w-3" /> Reset
              </button>
              <button onClick={() => { setFile(null); setPdfBytes(null); setPages([]); setResultUrl(null); }}
                className="flex items-center gap-1 rounded border border-primary/20 px-2 py-1 text-[10px] text-muted-foreground transition-all hover:text-primary hover:border-primary/40">
                <Upload className="h-3 w-3" /> New File
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {pages.map((page, i) => (
              <div
                key={`${page.index}-${i}`}
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragOver={(e) => handleDragOver(e, i)}
                onDragEnd={handleDragEnd}
                className={`group relative flex flex-col items-center rounded border-2 p-2 cursor-grab active:cursor-grabbing transition-all ${
                  dragIndex === i
                    ? "opacity-40 border-primary/60 scale-95"
                    : dragOverIndex === i
                    ? "border-primary bg-primary/10 scale-105"
                    : page.index !== i
                    ? "border-secondary/40 bg-secondary/5"
                    : "border-primary/15 bg-card hover:border-primary/40"
                }`}
              >
                {/* Drag handle */}
                <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
                </div>

                {/* Reorder badge */}
                <div className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground shadow-md">
                  {i + 1}
                </div>

                {/* Thumbnail */}
                <img src={page.dataUrl} alt={page.label} className="w-full rounded-sm" draggable={false} />

                {/* Original label */}
                <p className="mt-1.5 text-[9px] text-muted-foreground font-mono">
                  {page.label}
                  {page.index !== i && <span className="text-secondary ml-1">→ #{i + 1}</span>}
                </p>

                {/* Move buttons */}
                <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => moveUp(i)} disabled={i === 0}
                    className="rounded bg-primary/10 p-0.5 text-primary hover:bg-primary/20 disabled:opacity-30 disabled:pointer-events-none">
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button onClick={() => moveDown(i)} disabled={i === pages.length - 1}
                    className="rounded bg-primary/10 p-0.5 text-primary hover:bg-primary/20 disabled:opacity-30 disabled:pointer-events-none">
                    <ArrowDown className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button onClick={buildReorderedPdf} disabled={generating}
              className="flex-1 flex items-center justify-center gap-2 rounded bg-primary px-6 py-3 font-heading text-xs font-bold text-primary-foreground transition-all hover:bg-primary/90 neon-glow disabled:opacity-50">
              {generating ? (<><Loader2 className="h-4 w-4 animate-spin" /> Building PDF...</>) : (<><FileText className="h-4 w-4" /> Save Reordered PDF</>)}
            </button>
            {resultUrl && (
              <a href={resultUrl} download="reordered.pdf"
                className="flex items-center gap-2 rounded border border-primary px-6 py-3 font-heading text-xs font-bold text-primary transition-all hover:bg-primary/10">
                <Download className="h-4 w-4" /> Download
              </a>
            )}
          </div>

          {resultUrl && (
            <div className="rounded border border-primary/20 bg-primary/5 p-4 text-center">
              <p className="text-sm text-foreground">✅ Reordered PDF is ready!</p>
              <p className="text-xs text-muted-foreground mt-1">
                New order: {pages.map(p => p.index + 1).join(" → ")}
              </p>
            </div>
          )}
        </>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default PDFReorderTool;
