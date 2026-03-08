import { Link } from "react-router-dom";
import { Check, X } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    features: [
      { text: "20+ free tools", included: true },
      { text: "Basic tool access", included: true },
      { text: "5 uses per day", included: true },
      { text: "Community support", included: true },
      { text: "Advanced AI tools", included: false },
      { text: "API access", included: false },
      { text: "Priority processing", included: false },
    ],
    cta: "Get Started",
    popular: false,
    color: "primary",
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "For power users and professionals",
    features: [
      { text: "All 50+ tools", included: true },
      { text: "Unlimited usage", included: true },
      { text: "AI-powered tools", included: true },
      { text: "API access", included: true },
      { text: "Priority processing", included: true },
      { text: "Save results history", included: true },
      { text: "Email support", included: true },
    ],
    cta: "Start Pro Trial",
    popular: true,
    color: "secondary",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For teams and organizations",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Custom integrations", included: true },
      { text: "Dedicated support", included: true },
      { text: "SLA guarantee", included: true },
      { text: "Custom workflows", included: true },
      { text: "White-label options", included: true },
      { text: "Bulk API access", included: true },
    ],
    cta: "Contact Sales",
    popular: false,
    color: "accent",
  },
];

const Pricing = () => {
  return (
    <div className="cyber-grid min-h-screen py-16">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h1 className="font-heading text-3xl font-bold text-primary neon-text md:text-4xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Start free. Upgrade when you need more power.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded border bg-card p-6 transition-all ${
                plan.popular
                  ? "border-secondary/50 neon-glow-magenta scale-105"
                  : "border-primary/20 border-glow"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded bg-secondary px-3 py-0.5 font-heading text-[10px] font-bold text-secondary-foreground">
                  MOST POPULAR
                </div>
              )}
              <div>
                <h3 className="font-heading text-lg font-bold text-foreground">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-heading text-3xl font-black text-primary">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mt-6 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <div key={f.text} className="flex items-center gap-2 text-sm">
                    {f.included ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground/30" />
                    )}
                    <span className={f.included ? "text-foreground" : "text-muted-foreground/50"}>
                      {f.text}
                    </span>
                  </div>
                ))}
              </div>

              <Link
                to="/signup"
                className={`mt-6 block rounded py-3 text-center font-heading text-xs font-bold transition-all ${
                  plan.popular
                    ? "bg-secondary text-secondary-foreground neon-glow-magenta hover:bg-secondary/90"
                    : "border border-primary/30 text-primary hover:bg-primary/10"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
