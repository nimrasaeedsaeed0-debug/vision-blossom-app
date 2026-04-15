import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Crown, Zap } from "lucide-react";

const tiers = [
  {
    name: "Free",
    monthly: 0,
    annual: 0,
    desc: "Perfect for getting started",
    cta: "Get Started Free",
    ctaVariant: "outline" as const,
    features: [
      "5 GB storage",
      "100 AI generations/month",
      "500+ free templates",
      "PNG & JPG download",
      "Basic canvas editor",
      "Flash AI watermark on exports",
    ],
  },
  {
    name: "Pro",
    monthly: 12.99,
    annual: 10.39,
    desc: "For serious creators",
    cta: "Upgrade to Pro",
    ctaVariant: "default" as const,
    popular: true,
    features: [
      "100 GB storage",
      "Unlimited AI generations",
      "1,000+ templates (incl. Pro)",
      "All formats (PDF, SVG, GIF, MP4)",
      "No watermark",
      "Unlimited background removal",
      "Custom font uploads",
      "Brand Kit (up to 3 brands)",
      "60-day version history",
      "Priority email support",
    ],
  },
  {
    name: "Teams",
    monthly: 29.99,
    annual: 23.99,
    desc: "For teams that move fast",
    cta: "Start Team Trial",
    ctaVariant: "outline" as const,
    features: [
      "Everything in Pro",
      "Real-time collaboration",
      "Unlimited brand kits",
      "Team shared folders",
      "Admin dashboard",
      "User role management",
      "Unlimited version history",
      "Dedicated account manager",
    ],
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-16 animate-fade-in">
      <div className="mb-12 text-center">
        <h1 className="font-heading text-4xl font-bold md:text-5xl">
          Simple, transparent pricing
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Start free. Upgrade when you're ready.
        </p>
        <div className="mt-6 inline-flex items-center gap-3 rounded-full border bg-muted p-1">
          <button
            onClick={() => setAnnual(false)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${!annual ? "bg-background shadow-sm" : "text-muted-foreground"}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${annual ? "bg-background shadow-sm" : "text-muted-foreground"}`}
          >
            Annual
            <span className="ml-1.5 rounded-full bg-success/20 px-2 py-0.5 text-xs text-success">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
              tier.popular
                ? "border-primary bg-primary/5 shadow-md glow-primary"
                : "border-border/50 bg-card"
            }`}
          >
            {tier.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full gradient-primary px-4 py-1 text-xs font-medium text-primary-foreground">
                Most Popular
              </div>
            )}
            <div className="mb-6">
              <h3 className="font-heading text-xl font-bold flex items-center gap-2">
                {tier.name}
                {tier.name === "Pro" && <Crown className="h-4 w-4 text-warning" />}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{tier.desc}</p>
              <div className="mt-4">
                <span className="font-heading text-4xl font-bold">
                  ${annual ? tier.annual : tier.monthly}
                </span>
                {tier.monthly > 0 && (
                  <span className="text-muted-foreground">/month</span>
                )}
              </div>
            </div>
            <ul className="mb-6 flex-1 space-y-3">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Button
              variant={tier.ctaVariant}
              className={`w-full transition-all duration-200 hover:scale-[1.02] ${tier.popular ? "gradient-primary text-primary-foreground hover:glow-primary" : ""}`}
              asChild
            >
              <Link to="/signup">{tier.cta}</Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
