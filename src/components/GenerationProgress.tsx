import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface Props {
  active: boolean;
  estimatedSeconds?: number;
  label?: string;
}

export function GenerationProgress({ active, estimatedSeconds = 12, label = "Generating" }: Props) {
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!active) {
      setProgress(0);
      setElapsed(0);
      return;
    }
    const start = Date.now();
    const interval = setInterval(() => {
      const sec = (Date.now() - start) / 1000;
      setElapsed(sec);
      // Asymptotic progress that never quite reaches 100%
      const pct = Math.min(95, (sec / estimatedSeconds) * 100);
      setProgress(pct);
    }, 200);
    return () => clearInterval(interval);
  }, [active, estimatedSeconds]);

  if (!active) return null;
  const remaining = Math.max(0, estimatedSeconds - elapsed);

  return (
    <div className="rounded-lg border bg-card p-3 animate-fade-in">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="flex items-center gap-2 font-medium">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          {label}…
        </span>
        <span className="text-muted-foreground">~{Math.ceil(remaining)}s remaining</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full gradient-primary transition-[width] duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
