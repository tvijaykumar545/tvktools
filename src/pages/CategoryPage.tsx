import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { categories, tools as staticTools } from "@/data/tools";
import ToolCard from "@/components/ToolCard";
import { useManagedTools } from "@/hooks/useManagedTools";

const CategoryPage = () => {
  const { id } = useParams<{ id: string }>();
  const category = categories.find((c) => c.id === id);
  const { data: dbTools } = useManagedTools();
  const tools = useMemo(() => {
    if (!dbTools || dbTools.length === 0) return staticTools;
    const dbIds = new Set(dbTools.map(t => t.id));
    const missingStatic = staticTools.filter(t => !dbIds.has(t.id));
    return [...dbTools, ...missingStatic];
  }, [dbTools]);
  const catTools = id ? tools.filter(t => t.category === id) : [];

  if (!category) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-2xl text-primary">Category not found</h1>
          <Link to="/categories" className="mt-4 inline-block text-sm text-muted-foreground hover:text-primary">
            ← Back to categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cyber-grid min-h-screen py-8">
      <div className="container mx-auto px-4">
        <Link to="/categories" className="text-xs text-muted-foreground hover:text-primary">
          ← All Categories
        </Link>
        <div className="mt-4 flex items-center gap-3">
          <category.icon className="h-8 w-8 text-primary" />
          <div>
            <h1 className="font-heading text-3xl font-bold text-primary neon-text">{category.name}</h1>
            <p className="text-sm text-muted-foreground">{category.description}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {catTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
