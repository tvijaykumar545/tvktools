import { Link, useLocation } from "react-router-dom";
import { Search, Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const links = [
    { to: "/", label: "Home" },
    { to: "/tools", label: "Tools" },
    { to: "/categories", label: "Categories" },
    { to: "/pricing", label: "Pricing" },
    { to: "/blog", label: "Blog" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-primary/20 bg-background/90 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded border border-primary/50 bg-primary/10 font-heading text-xs font-bold text-primary neon-glow">
            TVK
          </div>
          <span className="font-heading text-lg font-bold text-primary neon-text">
            TVK Tools
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded px-3 py-2 font-body text-sm transition-all hover:bg-primary/10 hover:text-primary ${
                location.pathname === link.to
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/tools"
            className="flex h-9 items-center gap-2 rounded border border-primary/30 bg-muted px-3 text-sm text-muted-foreground transition-all hover:border-primary/50"
          >
            <Search className="h-4 w-4" />
            Search tools...
          </Link>
          <Link
            to="/login"
            className="rounded border border-primary/30 px-4 py-2 font-heading text-xs font-semibold text-primary transition-all hover:bg-primary/10 hover:neon-glow"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="rounded bg-primary px-4 py-2 font-heading text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90 neon-glow"
          >
            Sign Up
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-primary md:hidden"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-primary/20 bg-background/95 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1 p-4">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="rounded px-3 py-2 text-sm text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2">
              <Link to="/login" className="flex-1 rounded border border-primary/30 px-4 py-2 text-center font-heading text-xs text-primary">
                Login
              </Link>
              <Link to="/signup" className="flex-1 rounded bg-primary px-4 py-2 text-center font-heading text-xs text-primary-foreground neon-glow">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
