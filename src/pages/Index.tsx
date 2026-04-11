import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Sparkles, Wand2, Image, Palette } from "lucide-react";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center gap-6 px-4 py-24 text-center md:py-32">
        <div className="inline-flex items-center gap-2 rounded-full border bg-accent px-4 py-1.5 text-sm text-accent-foreground">
          <Sparkles className="h-4 w-4" />
          AI-Powered Image Generation
        </div>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
          Turn your words into{" "}
          <span className="text-primary">stunning images</span>
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Create beautiful, unique images from text descriptions. Choose styles,
          sizes, and edit with our built-in tools.
        </p>
        <div className="flex gap-3">
          <Button size="lg" asChild>
            <Link to={user ? "/dashboard" : "/signup"}>
              Start Creating
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to={user ? "/dashboard" : "/login"}>
              {user ? "Dashboard" : "Log in"}
            </Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/50 px-4 py-20">
        <div className="container mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
          {[
            { icon: Wand2, title: "Text to Image", desc: "Describe what you want and watch AI bring it to life." },
            { icon: Image, title: "Multiple Styles", desc: "Realistic, anime, cinematic, digital art — your choice." },
            { icon: Palette, title: "Built-in Editor", desc: "Crop, resize, and apply filters without leaving the app." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center gap-3 rounded-xl border bg-card p-6 text-center shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
