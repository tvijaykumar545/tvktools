import { Link } from "react-router-dom";
import { categories } from "@/data/tools";

const Footer = () => {
  return (
    <footer className="border-t border-primary/20 bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link to="/" className="font-heading text-lg font-bold text-primary neon-text">
              TVK Tools
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              50+ AI-powered tools for SEO, developers, and creators. Free to use, built for productivity.
            </p>
          </div>

          <div>
            <h4 className="mb-3 font-heading text-xs font-semibold uppercase tracking-wider text-primary">
              Categories
            </h4>
            <div className="flex flex-col gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/categories/${cat.id}`}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-3 font-heading text-xs font-semibold uppercase tracking-wider text-primary">
              Platform
            </h4>
            <div className="flex flex-col gap-2">
              {["Pricing", "Blog", "API Access", "Documentation"].map((item) => (
                <Link
                  key={item}
                  to={`/${item.toLowerCase().replace(" ", "-")}`}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-3 font-heading text-xs font-semibold uppercase tracking-wider text-primary">
              Legal
            </h4>
            <div className="flex flex-col gap-2">
              {["About", "Contact", "Privacy Policy", "Terms & Conditions"].map((item) => (
                <Link
                  key={item}
                  to={`/${item.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-")}`}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-primary/10 pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} TVK Tools. All rights reserved. Powered by n8n automation.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
