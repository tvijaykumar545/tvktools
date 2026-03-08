import { Link } from "react-router-dom";
import { categories, getToolsByCategory } from "@/data/tools";

const Categories = () => {
  return (
    <div className="cyber-grid min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="font-heading text-3xl font-bold text-primary neon-text">Categories</h1>
        <p className="mt-1 text-sm text-muted-foreground">Explore tools by category</p>

        <div className="mt-8 space-y-12">
          {categories.map((cat) => {
            const catTools = getToolsByCategory(cat.id);
            return (
              <section key={cat.id}>
                <div className="mb-4 flex items-center gap-3">
                  <cat.icon className="h-6 w-6 text-primary" />
                  <h2 className="font-heading text-xl font-bold text-foreground">{cat.name}</h2>
                  <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-heading text-primary">
                    {catTools.length} tools
                  </span>
                </div>
                <p className="mb-4 text-sm text-muted-foreground">{cat.description}</p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {catTools.map((tool) => (
                    <Link
                      key={tool.id}
                      to={`/tool/${tool.id}`}
                      className="flex items-center gap-3 rounded border border-primary/10 bg-card p-4 transition-all hover:border-primary/40 hover:bg-surface-hover border-glow"
                    >
                      <span className="text-xl">{tool.icon}</span>
                      <div>
                        <div className="font-heading text-xs font-semibold text-foreground">{tool.name}</div>
                        <div className="text-[10px] text-muted-foreground">{tool.description}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Categories;
