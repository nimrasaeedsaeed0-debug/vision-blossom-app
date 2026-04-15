import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface FlashLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function FlashLogo({ size = "md", className }: FlashLogoProps) {
  const iconSizes = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-8 w-8" };
  const textSizes = { sm: "text-base", md: "text-xl", lg: "text-2xl" };

  return (
    <span className={cn("inline-flex items-center gap-1.5 font-heading font-bold", className)}>
      <Zap className={cn(iconSizes[size], "text-primary fill-primary")} />
      <span className={textSizes[size]}>
        Flash<span className="text-cyan">AI</span>
      </span>
    </span>
  );
}
