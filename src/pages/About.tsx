import { Users, Zap, Globe, Shield } from "lucide-react";

const About = () => {
  return (
    <div className="cyber-grid min-h-screen py-16">
      <div className="container mx-auto max-w-3xl px-4">
        <h1 className="font-heading text-3xl font-bold text-primary neon-text">About TVK Tools</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          TVK Tools is a powerful AI-driven SaaS platform offering 50+ free and premium tools designed for SEO professionals, developers, content creators, and everyday productivity.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {[
            { icon: Zap, title: "AI-Powered", desc: "Leverage cutting-edge AI models to generate content, analyze data, and automate workflows." },
            { icon: Globe, title: "n8n Automation", desc: "Backend tools are powered by n8n workflow automation for reliable, scalable processing." },
            { icon: Users, title: "Built for Everyone", desc: "From solo creators to enterprise teams — tools that scale with your needs." },
            { icon: Shield, title: "Secure & Private", desc: "Your data is never stored or shared. All processing is done securely in real-time." },
          ].map((item) => (
            <div key={item.title} className="rounded border border-primary/10 bg-card p-6 border-glow">
              <item.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-3 font-heading text-sm font-bold text-foreground">{item.title}</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <section className="mt-12">
          <h2 className="font-heading text-xl font-bold text-foreground">Our Mission</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            We believe powerful tools should be accessible to everyone. TVK Tools combines AI intelligence with automation to help you work smarter, not harder. Whether you're optimizing for search engines, formatting code, generating creative content, or converting files — we've got you covered.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-heading text-xl font-bold text-foreground">Technology Stack</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {["React", "TypeScript", "TailwindCSS", "Supabase", "n8n", "Vite"].map((tech) => (
              <span key={tech} className="rounded border border-primary/20 bg-primary/10 px-3 py-1 font-heading text-[10px] text-primary">
                {tech}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
