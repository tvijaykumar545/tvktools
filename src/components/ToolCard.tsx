import { Link } from "react-router-dom";
import type { Tool } from "@/data/tools";
import { Badge } from "@/components/ui/badge";

interface ToolCardProps {
  tool: Tool;
}

const ToolCard = ({ tool }: ToolCardProps) => {
  return (
    <Link
      to={`/tool/${tool.id}`}
      className="group relative flex flex-col gap-3 rounded border border-primary/10 bg-card p-5 transition-all duration-300 hover:border-primary/40 hover:bg-surface-hover border-glow"
    >
      <div className="flex items-start justify-between">
        <span className="text-2xl">{tool.icon}</span>
        <div className="flex gap-1.5">
          {tool.isNew && (
            <Badge className="border-accent/50 bg-accent/10 text-accent text-[10px] font-heading">
              NEW
            </Badge>
          )}
          {tool.isPopular && (
            <Badge className="border-secondary/50 bg-secondary/10 text-secondary text-[10px] font-heading">
              HOT
            </Badge>
          )}
          {tool.isFree ? (
            <Badge className="border-primary/50 bg-primary/10 text-primary text-[10px] font-heading">
              FREE
            </Badge>
          ) : (
            <Badge className="border-muted-foreground/50 bg-muted text-muted-foreground text-[10px] font-heading">
              PRO
            </Badge>
          )}
        </div>
      </div>

      <div>
        <h3 className="font-heading text-sm font-semibold text-foreground transition-all group-hover:text-primary group-hover:neon-text">
          {tool.name}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
          {tool.description}
        </p>
      </div>

      <div className="mt-auto flex items-center gap-2 text-[10px] text-muted-foreground">
        <span className="rounded bg-muted px-1.5 py-0.5 font-heading uppercase">
          {tool.category}
        </span>
        <span className="rounded bg-muted px-1.5 py-0.5">
          {tool.type === "frontend" ? "Instant" : "AI-Powered"}
        </span>
      </div>
    </Link>
  );
};

export default ToolCard;
