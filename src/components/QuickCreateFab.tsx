import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, Zap, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";

const HIDDEN_ROUTES = ["/", "/login", "/signup", "/pricing"];

export function QuickCreateFab() {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const hidden = !user || HIDDEN_ROUTES.includes(location.pathname);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const submit = () => {
    if (!prompt.trim()) return;
    navigate(`/ai-tools?prompt=${encodeURIComponent(prompt.trim())}`);
    setPrompt("");
    setOpen(false);
  };

  if (hidden) return null;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-background/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setOpen(false)}
        />
      )}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {open && (
          <div className="w-[min(420px,calc(100vw-3rem))] rounded-2xl border bg-card p-3 shadow-2xl animate-scale-in">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold">Quick Create</span>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <Textarea
              autoFocus
              placeholder="Describe what you want to create..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
              }}
              className="min-h-[80px] resize-none text-sm"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">⌘/Ctrl + Enter</span>
              <Button size="sm" onClick={submit} disabled={!prompt.trim()} className="gradient-primary">
                <Zap className="mr-1 h-4 w-4 fill-current" /> Generate
              </Button>
            </div>
          </div>
        )}
        <Button
          size="icon"
          onClick={() => setOpen((o) => !o)}
          className="h-14 w-14 rounded-full gradient-primary shadow-lg hover:scale-105 transition-transform"
          aria-label="Quick create"
        >
          {open ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
        </Button>
      </div>
    </>
  );
}
