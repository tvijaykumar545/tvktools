import { Link } from "react-router-dom";
import { Check, Zap, Sparkles, Crown, Rocket, BatteryCharging } from "lucide-react";

const plans = [
  {
    name: "Starter",
    points: 100,
    price: "₹99",
    description: "Entry level — try out premium tools",
    icon: Zap,
    features: [
      "100 points credited instantly",
      "Access all tools",
      "Basic support",
    ],
    popular: false,
  },
  {
    name: "Basic",
    points: 300,
    price: "₹249",
    description: "Small discount for casual users",
    icon: Sparkles,
    features: [
      "300 points credited instantly",
      "Access all tools",
      "Save ₹48 vs Starter",
    ],
    popular: false,
  },
  {
    name: "Standard",
    points: 700,
    price: "₹499",
    description: "Best value for regular users",
    icon: Sparkles,
    features: [
      "700 points credited instantly",
      "Access all tools",
      "Save ₹194 vs Starter",
      "Priority support",
    ],
    popular: true,
  },
  {
    name: "Pro",
    points: 1500,
    price: "₹899",
    description: "Power users' favourite",
    icon: Crown,
    features: [
      "1500 points credited instantly",
      "Access all tools",
      "Save ₹586 vs Starter",
      "Priority support",
    ],
    popular: false,
  },
  {
    name: "Power",
    points: 5000,
    price: "₹2,499",
    description: "Maximum points for bulk usage",
    icon: BatteryCharging,
    features: [
      "5000 points credited instantly",
      "Access all tools",
      "Save ₹2,451 vs Starter",
      "Priority support",
      "Best per-point price",
    ],
    popular: false,
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
            Buy points and use them across all premium tools. Pay via UPI.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
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
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <h3 className="font-heading text-lg font-bold text-foreground">{plan.name}</h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-heading text-3xl font-black text-primary">{plan.price}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{plan.description}</p>
                <div className="mt-2 text-sm font-semibold text-foreground">
                  {plan.points.toLocaleString()} points
                </div>

                <div className="mt-4 flex-1 space-y-2">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-foreground">{f}</span>
                    </div>
                  ))}
                </div>

                <Link
                  to="/buy-points"
                  className={`mt-6 block rounded py-3 text-center font-heading text-xs font-bold transition-all ${
                    plan.popular
                      ? "bg-secondary text-secondary-foreground neon-glow-magenta hover:bg-secondary/90"
                      : "border border-primary/30 text-primary hover:bg-primary/10"
                  }`}
                >
                  Buy Now
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
