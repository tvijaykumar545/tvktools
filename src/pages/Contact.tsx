import { useState } from "react";
import { Mail, MapPin, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Send contact confirmation email
    const id = crypto.randomUUID();
    await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "contact-confirmation",
        recipientEmail: form.email,
        idempotencyKey: `contact-confirm-${id}`,
        templateData: { name: form.name },
      },
    });
  };

  return (
    <div className="cyber-grid min-h-screen py-16">
      <div className="container mx-auto max-w-3xl px-4">
        <h1 className="font-heading text-3xl font-bold text-primary neon-text">Contact Us</h1>
        <p className="mt-2 text-sm text-muted-foreground">Have a question or feedback? We'd love to hear from you.</p>

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            { icon: Mail, label: "Email", value: "support@tvktools.com" },
            { icon: MessageSquare, label: "Response Time", value: "Within 24 hours" },
            { icon: MapPin, label: "Platform", value: "100% Online" },
          ].map((item) => (
            <div key={item.label} className="rounded border border-primary/10 bg-card p-4 text-center border-glow">
              <item.icon className="mx-auto h-5 w-5 text-primary" />
              <div className="mt-2 font-heading text-xs font-bold text-foreground">{item.label}</div>
              <div className="mt-1 text-[10px] text-muted-foreground">{item.value}</div>
            </div>
          ))}
        </div>

        {submitted ? (
          <div className="mt-8 rounded border border-primary/20 bg-card p-8 text-center neon-glow">
            <div className="text-3xl">✅</div>
            <h2 className="mt-3 font-heading text-xl font-bold text-primary neon-text">Message Sent!</h2>
            <p className="mt-2 text-sm text-muted-foreground">We'll get back to you within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded border border-primary/20 bg-card p-6">
            <div>
              <label className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 h-10 w-full rounded border border-primary/20 bg-muted px-3 text-sm text-foreground outline-none focus:border-primary/50"
              />
            </div>
            <div>
              <label className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1 h-10 w-full rounded border border-primary/20 bg-muted px-3 text-sm text-foreground outline-none focus:border-primary/50"
              />
            </div>
            <div>
              <label className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Message</label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="mt-1 w-full rounded border border-primary/20 bg-muted p-3 text-sm text-foreground outline-none focus:border-primary/50 resize-none"
              />
            </div>
            <button type="submit" className="w-full rounded bg-primary py-3 font-heading text-xs font-bold text-primary-foreground neon-glow">
              Send Message
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Contact;
