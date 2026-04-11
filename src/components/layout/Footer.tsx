import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-background py-8">
      <div className="container mx-auto flex flex-col items-center gap-4 px-4 text-center text-sm text-muted-foreground">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          ImageForge
        </div>
        <p>AI-powered image generation. Create stunning visuals from text.</p>
        <p>&copy; {new Date().getFullYear()} ImageForge. All rights reserved.</p>
      </div>
    </footer>
  );
}
