import { useState, useRef, useCallback } from "react";
import { GripVertical, Plus, Trash2, Type, Image, MousePointerClick, Minus, Heading, ChevronDown } from "lucide-react";

export type BlockType = "header" | "text" | "image" | "button" | "spacer";

export interface EmailBlock {
  id: string;
  type: BlockType;
  data: Record<string, string>;
}

const BLOCK_TYPES: { type: BlockType; label: string; icon: React.ReactNode }[] = [
  { type: "header", label: "Header", icon: <Heading className="h-4 w-4" /> },
  { type: "text", label: "Text", icon: <Type className="h-4 w-4" /> },
  { type: "image", label: "Image", icon: <Image className="h-4 w-4" /> },
  { type: "button", label: "Button", icon: <MousePointerClick className="h-4 w-4" /> },
  { type: "spacer", label: "Spacer", icon: <Minus className="h-4 w-4" /> },
];

const createBlock = (type: BlockType): EmailBlock => ({
  id: crypto.randomUUID(),
  type,
  data:
    type === "header" ? { text: "Your Heading", level: "h1", align: "left" }
    : type === "text" ? { text: "Your paragraph text here...", align: "left" }
    : type === "image" ? { src: "", alt: "Image", width: "100" }
    : type === "button" ? { text: "Click Here", url: "https://", align: "center", color: "#00ffff" }
    : { height: "24" },
});

export function blocksToHtml(blocks: EmailBlock[], accentColor: string): string {
  const rows = blocks.map((b) => {
    switch (b.type) {
      case "header": {
        const tag = b.data.level || "h1";
        const size = tag === "h1" ? "22px" : tag === "h2" ? "18px" : "15px";
        return `<tr><td style="padding:16px 25px;text-align:${b.data.align || "left"}"><${tag} style="margin:0;font-size:${size};font-weight:bold;color:#0a0a14">${b.data.text}</${tag}></td></tr>`;
      }
      case "text":
        return `<tr><td style="padding:8px 25px;text-align:${b.data.align || "left"}"><p style="margin:0;font-size:14px;color:#333;line-height:1.7;white-space:pre-wrap">${b.data.text}</p></td></tr>`;
      case "image":
        return `<tr><td style="padding:12px 25px;text-align:center">${b.data.src ? `<img src="${b.data.src}" alt="${b.data.alt || ""}" style="max-width:${b.data.width || "100"}%;height:auto;border-radius:4px" />` : `<div style="background:#f0f0f0;padding:40px;color:#999;font-size:12px;border-radius:4px">Image placeholder</div>`}</td></tr>`;
      case "button":
        return `<tr><td style="padding:16px 25px;text-align:${b.data.align || "center"}"><a href="${b.data.url || "#"}" style="display:inline-block;padding:12px 28px;background:${b.data.color || accentColor};color:#0a0a14;font-weight:bold;font-size:13px;border-radius:4px;text-decoration:none;letter-spacing:1px">${b.data.text}</a></td></tr>`;
      case "spacer":
        return `<tr><td style="height:${b.data.height || "24"}px"></td></tr>`;
      default:
        return "";
    }
  }).join("\n");

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:'Space Mono','Courier New',Courier,monospace">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto">
<tr><td style="background:#0a0a14;padding:24px 25px;text-align:center">
<span style="color:${accentColor};font-size:20px;font-weight:bold;letter-spacing:2px">⚡ tvktools</span>
</td></tr>
${rows}
<tr><td style="padding:20px 25px;border-top:1px solid #e0e0e0"><p style="font-size:12px;color:#999;margin:0">This message was sent by the tvktools team.</p></td></tr>
</table></body></html>`;
}

interface Props {
  blocks: EmailBlock[];
  onChange: (blocks: EmailBlock[]) => void;
  accentColor: string;
}

export default function EmailBlockEditor({ blocks, onChange, accentColor }: Props) {
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const dragItem = useRef<number | null>(null);
  const dragOver = useRef<number | null>(null);

  const addBlock = (type: BlockType) => {
    onChange([...blocks, createBlock(type)]);
    setAddMenuOpen(false);
  };

  const removeBlock = (id: string) => onChange(blocks.filter((b) => b.id !== id));

  const updateBlockData = (id: string, field: string, value: string) => {
    onChange(blocks.map((b) => (b.id === id ? { ...b, data: { ...b.data, [field]: value } } : b)));
  };

  const handleDragStart = (idx: number) => { dragItem.current = idx; };
  const handleDragEnter = (idx: number) => { dragOver.current = idx; };
  const handleDragEnd = () => {
    if (dragItem.current === null || dragOver.current === null) return;
    const copy = [...blocks];
    const [moved] = copy.splice(dragItem.current, 1);
    copy.splice(dragOver.current, 0, moved);
    onChange(copy);
    dragItem.current = null;
    dragOver.current = null;
  };

  const inputCls = "h-8 w-full rounded border border-primary/20 bg-background px-2.5 text-xs text-foreground outline-none focus:border-primary/50";
  const labelCls = "font-heading text-[9px] font-semibold uppercase tracking-wider text-muted-foreground";

  const renderBlockEditor = (block: EmailBlock) => {
    switch (block.type) {
      case "header":
        return (
          <div className="space-y-2">
            <input value={block.data.text} onChange={(e) => updateBlockData(block.id, "text", e.target.value)} className={inputCls} placeholder="Heading text" />
            <div className="flex gap-2">
              {["h1", "h2", "h3"].map((h) => (
                <button key={h} onClick={() => updateBlockData(block.id, "level", h)} className={`px-2 py-1 rounded text-[10px] font-heading font-bold uppercase ${block.data.level === h ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground"}`}>
                  {h.toUpperCase()}
                </button>
              ))}
              <div className="flex-1" />
              {["left", "center", "right"].map((a) => (
                <button key={a} onClick={() => updateBlockData(block.id, "align", a)} className={`px-2 py-1 rounded text-[10px] font-heading ${block.data.align === a ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground"}`}>
                  {a[0].toUpperCase() + a.slice(1)}
                </button>
              ))}
            </div>
          </div>
        );
      case "text":
        return (
          <div className="space-y-2">
            <textarea value={block.data.text} onChange={(e) => updateBlockData(block.id, "text", e.target.value)} rows={3} className="w-full rounded border border-primary/20 bg-background p-2.5 text-xs text-foreground outline-none focus:border-primary/50 resize-none" placeholder="Paragraph text..." />
            <div className="flex gap-2">
              {["left", "center", "right"].map((a) => (
                <button key={a} onClick={() => updateBlockData(block.id, "align", a)} className={`px-2 py-1 rounded text-[10px] font-heading ${block.data.align === a ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground"}`}>
                  {a[0].toUpperCase() + a.slice(1)}
                </button>
              ))}
            </div>
            <p className="text-[9px] text-muted-foreground">Use {"{{name}}"} for recipient name</p>
          </div>
        );
      case "image":
        return (
          <div className="space-y-2">
            <label className={labelCls}>Image URL</label>
            <input value={block.data.src} onChange={(e) => updateBlockData(block.id, "src", e.target.value)} className={inputCls} placeholder="https://..." />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelCls}>Alt Text</label>
                <input value={block.data.alt} onChange={(e) => updateBlockData(block.id, "alt", e.target.value)} className={inputCls} placeholder="Alt text" />
              </div>
              <div>
                <label className={labelCls}>Width %</label>
                <input type="number" min="10" max="100" value={block.data.width} onChange={(e) => updateBlockData(block.id, "width", e.target.value)} className={inputCls} />
              </div>
            </div>
          </div>
        );
      case "button":
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelCls}>Button Text</label>
                <input value={block.data.text} onChange={(e) => updateBlockData(block.id, "text", e.target.value)} className={inputCls} placeholder="Click Here" />
              </div>
              <div>
                <label className={labelCls}>URL</label>
                <input value={block.data.url} onChange={(e) => updateBlockData(block.id, "url", e.target.value)} className={inputCls} placeholder="https://..." />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className={labelCls}>Color</label>
              <input type="color" value={block.data.color || accentColor} onChange={(e) => updateBlockData(block.id, "color", e.target.value)} className="h-6 w-6 rounded cursor-pointer border-0 bg-transparent" />
              {["left", "center", "right"].map((a) => (
                <button key={a} onClick={() => updateBlockData(block.id, "align", a)} className={`px-2 py-1 rounded text-[10px] font-heading ${block.data.align === a ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground"}`}>
                  {a[0].toUpperCase() + a.slice(1)}
                </button>
              ))}
            </div>
          </div>
        );
      case "spacer":
        return (
          <div className="flex items-center gap-3">
            <label className={labelCls}>Height (px)</label>
            <input type="number" min="4" max="120" value={block.data.height} onChange={(e) => updateBlockData(block.id, "height", e.target.value)} className="h-8 w-20 rounded border border-primary/20 bg-background px-2.5 text-xs text-foreground outline-none focus:border-primary/50" />
          </div>
        );
    }
  };

  const blockIcon = (type: BlockType) => BLOCK_TYPES.find((b) => b.type === type)?.icon;

  return (
    <div className="space-y-3">
      {/* Block list */}
      {blocks.length === 0 && (
        <div className="rounded border border-dashed border-primary/20 p-8 text-center">
          <p className="text-xs text-muted-foreground">No blocks yet. Add your first block below.</p>
        </div>
      )}

      {blocks.map((block, idx) => (
        <div
          key={block.id}
          draggable
          onDragStart={() => handleDragStart(idx)}
          onDragEnter={() => handleDragEnter(idx)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => e.preventDefault()}
          className="group rounded border border-primary/20 bg-background transition-all hover:border-primary/40"
        >
          {/* Block header */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-primary/10">
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab active:cursor-grabbing" />
            <span className="text-primary">{blockIcon(block.type)}</span>
            <span className="font-heading text-[10px] font-bold uppercase tracking-wider text-foreground">
              {BLOCK_TYPES.find((b) => b.type === block.type)?.label}
            </span>
            <div className="flex-1" />
            <button onClick={() => removeBlock(block.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          {/* Block content editor */}
          <div className="p-3">{renderBlockEditor(block)}</div>
        </div>
      ))}

      {/* Add block button */}
      <div className="relative">
        <button
          onClick={() => setAddMenuOpen(!addMenuOpen)}
          className="flex w-full items-center justify-center gap-2 rounded border border-dashed border-primary/30 py-3 font-heading text-xs font-bold text-primary hover:bg-primary/5 transition-all"
        >
          <Plus className="h-4 w-4" /> Add Block <ChevronDown className={`h-3 w-3 transition-transform ${addMenuOpen ? "rotate-180" : ""}`} />
        </button>
        {addMenuOpen && (
          <div className="absolute bottom-full left-0 right-0 mb-1 z-10 rounded border border-primary/30 bg-card shadow-lg overflow-hidden">
            {BLOCK_TYPES.map((bt) => (
              <button
                key={bt.type}
                onClick={() => addBlock(bt.type)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-primary/10 transition-colors"
              >
                <span className="text-primary">{bt.icon}</span>
                <span className="font-heading text-xs font-bold text-foreground">{bt.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
