import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { FlashLogo } from "@/components/FlashLogo";
import {
  Zap, Wand2, Image, Layout, Users, Scissors,
  ArrowRight, Star, Play, MessageSquare, Sparkles
} from "lucide-react";

const features = [
  { icon: Sparkles, title: "AI Image Generation", desc: "Describe anything and watch AI create stunning visuals in seconds." },
  { icon: Layout, title: "Drag & Drop Editor", desc: "Intuitive canvas editor with layers, shapes, text, and smart guides." },
  { icon: Image, title: "1,000+ Templates", desc: "Professional templates for social media, marketing, and more." },
  { icon: Wand2, title: "AI Photo Enhancer", desc: "Upscale, sharpen, and enhance any image with one click." },
  { icon: Users, title: "Team Collaboration", desc: "Invite your team. Design together in real-time with shared projects." },
  { icon: Scissors, title: "Background Removal", desc: "Remove backgrounds instantly with AI. No manual editing needed." },
];

const steps = [
  { num: "01", title: "Choose or Generate", desc: "Pick a template or describe your idea to AI — it creates the design for you." },
  { num: "02", title: "Customize Everything", desc: "Use the drag-and-drop editor to tweak every detail until it's perfect." },
  { num: "03", title: "Export & Share", desc: "Download in any format — PNG, PDF, SVG, MP4 — or share a live link." },
];

const testimonials = [
  { name: "Sarah Chen", role: "Marketing Director", company: "TechCorp", quote: "Flash AI replaced three different tools for our team. The AI generation is incredible." },
  { name: "Alex Rivera", role: "Freelance Designer", company: "Self-employed", quote: "I create social media content 10x faster. The templates and AI tools are a game-changer." },
  { name: "Jordan Kim", role: "Startup Founder", company: "LaunchPad", quote: "We built our entire brand identity using Flash AI. No designer needed." },
  { name: "Maya Patel", role: "Content Creator", company: "YouTube", quote: "Thumbnails, banners, posts — I make everything here. The quality is insane." },
  { name: "David Okafor", role: "Product Manager", company: "FinoTech", quote: "Our design workflow went from days to minutes. The AI tools are pure magic." },
  { name: "Lisa Wang", role: "Social Media Manager", company: "BrandHive", quote: "The image enhancer alone saves me hours every week. My whole team runs on Flash AI." },
];

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-24 md:py-36">
        <div className="absolute inset-0 gradient-hero animate-gradient opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,hsl(var(--background))_80%)]" />
        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary-foreground backdrop-blur-sm">
            <Zap className="h-4 w-4 fill-current" />
            AI-Powered Creative Platform
          </div>
          <h1 className="text-5xl font-bold tracking-tighter text-primary-foreground md:text-7xl lg:text-8xl">
            Design Anything.{" "}
            <span className="block opacity-60">
              Generate Everything.
            </span>
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">
            Flash AI is the all-in-one creative platform where artificial intelligence
            does the heavy lifting. From idea to stunning design in seconds.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button size="lg" className="rounded-full px-8 text-base shadow-lg transition-all duration-200 hover:scale-[1.02]" asChild>
              <Link to={user ? "/dashboard" : "/signup"}>
                <Zap className="h-5 w-5 fill-current" />
                Start Creating Free
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full border-primary/30 px-8 text-base backdrop-blur-sm transition-all duration-200 hover:scale-[1.02]" asChild>
              <Link to={user ? "/dashboard" : "/login"}>
                <Play className="h-4 w-4" />
                Watch Demo
              </Link>
            </Button>
          </div>
          {/* Floating mockup placeholder */}
          <div className="mt-12 w-full max-w-3xl animate-float">
            <div className="aspect-video rounded-xl border border-primary/20 bg-card/50 shadow-2xl backdrop-blur-lg">
              <div className="flex h-8 items-center gap-2 border-b border-border/50 px-4">
                <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-warning/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-success/60" />
                <span className="ml-2 text-xs text-muted-foreground">Flash AI Editor</span>
              </div>
              <div className="flex h-[calc(100%-2rem)] items-center justify-center">
                <FlashLogo size="lg" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="border-y border-border/50 bg-card/50 px-4 py-6">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-1 text-sm font-medium">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-warning text-warning" />
            ))}
            <span className="ml-2 text-muted-foreground">Trusted by 50,000+ creators worldwide</span>
          </div>
          <div className="flex -space-x-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-gradient-to-br from-primary/40 to-cyan/40" />
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-3xl font-bold md:text-4xl">
              Everything you need. Nothing you don't.
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group flex flex-col gap-4 rounded-xl border border-border/50 bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:glow-primary"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg gradient-primary">
                  <Icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-heading text-lg font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y border-border/50 bg-card/50 px-4 py-20">
        <div className="container mx-auto max-w-5xl">
          <h2 className="mb-12 text-center font-heading text-3xl font-bold md:text-4xl">
            From idea to design in 3 steps
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map(({ num, title, desc }, i) => (
              <div key={num} className="relative flex flex-col items-center gap-4 text-center">
                <span className="font-heading text-5xl font-extrabold text-primary/20">{num}</span>
                <h3 className="font-heading text-xl font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
                {i < 2 && (
                  <ArrowRight className="absolute -right-4 top-8 hidden h-6 w-6 text-muted-foreground/30 md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <h2 className="mb-12 text-center font-heading text-3xl font-bold md:text-4xl">
            Loved by creators everywhere
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map(({ name, role, company, quote }) => (
              <div
                key={name}
                className="flex flex-col gap-4 rounded-xl border border-border/50 bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <MessageSquare className="h-5 w-5 text-primary/40" />
                <p className="text-sm text-muted-foreground italic">"{quote}"</p>
                <div className="mt-auto flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/30 to-cyan/30" />
                  <div>
                    <p className="text-sm font-medium">{name}</p>
                    <p className="text-xs text-muted-foreground">{role}, {company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20">
        <div className="container mx-auto max-w-3xl">
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-cyan/5 p-12 text-center">
            <h2 className="font-heading text-3xl font-bold md:text-4xl">
              Your next design is one prompt away.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Join 50,000+ creators already using Flash AI to design faster.
            </p>
            <Button size="lg" className="mt-8 gradient-primary rounded-full px-10 text-base shadow-lg transition-all duration-200 hover:scale-[1.02] hover:glow-primary" asChild>
              <Link to={user ? "/dashboard" : "/signup"}>
                Start for Free — No Credit Card Needed
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
