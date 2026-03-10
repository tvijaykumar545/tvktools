import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp } from "lucide-react";
import { useMostUsedTools } from "@/hooks/useMostUsedTools";
import { tools as staticTools } from "@/data/tools";
import ToolCard from "./ToolCard";
import { Skeleton } from "./ui/skeleton";

const MostUsedTools = () => {
  const { data: mostUsed, isLoading } = useMostUsedTools(8);

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-secondary" />
            <h2 className="font-heading text-2xl font-bold text-secondary neon-text-magenta">
              Most Used Tools
            </h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Based on real usage analytics</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded border border-primary/10" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!mostUsed || mostUsed.length === 0) return null;

  // Map usage data to full tool objects for ToolCard
  const toolsToShow = mostUsed
    .map((u) => staticTools.find((t) => t.id === u.tool_id))
    .filter(Boolean) as typeof staticTools;

  if (toolsToShow.length === 0) return null;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-secondary" />
              <h2 className="font-heading text-2xl font-bold text-secondary neon-text-magenta">
                Most Used Tools
              </h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Based on real usage analytics
            </p>
          </div>
          <Link
            to="/tools"
            className="flex items-center gap-1 text-xs text-secondary transition-all hover:gap-2"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {toolsToShow.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MostUsedTools;
