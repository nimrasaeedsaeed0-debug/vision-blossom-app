import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { GenerationProgress } from "@/components/GenerationProgress";
import type { LucideIcon } from "lucide-react";

interface ToolUploadShellProps {
  icon: LucideIcon;
  title: string;
  description: string;
  ctaLabel: string;
  instructionLabel?: string;
  instructionPlaceholder?: string;
  estimatedSeconds?: number;
  onProcess: (file: File, instruction: string, dataUrl: string) => Promise<string | null>;
  accept?: string;
}

const MAX_BYTES = 5 * 1024 * 1024;

export function ToolUploadShell({
  icon: Icon,
  title,
  description,
  ctaLabel,
  instructionLabel,
  instructionPlaceholder,
  estimatedSeconds = 10,
  onProcess,
  accept = "image/png,image/jpeg,image/webp",
}: ToolUploadShellProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [instruction, setInstruction] = useState("");
  const [result, setResult] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (f.size > MAX_BYTES) {
      toast.error("File must be 5MB or smaller");
      return;
    }
    setFile(f);
    setResult("");
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handleGo = async () => {
    if (!file || !preview) {
      toast.error("Upload an image first");
      return;
    }
    setBusy(true);
    setResult("");
    try {
      const out = await onProcess(file, instruction, preview);
      if (out) {
        setResult(out);
        toast.success("Done!");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  const download = (url: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `flashai-${Date.now()}.png`;
    a.click();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleGo();
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 animate-fade-in" onKeyDown={onKeyDown}>
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <h1 className="font-heading text-3xl font-bold">{title}</h1>
        <p className="mt-2 text-muted-foreground">{description}</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>Upload Image (PNG/JPG/WEBP, max 5MB)</Label>
            <input
              ref={fileRef}
              type="file"
              accept={accept}
              hidden
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/60 bg-muted/30 px-4 py-10 hover:border-primary/40 hover:bg-muted/50 transition-colors"
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm font-medium">
                {file ? file.name : "Click to choose a file"}
              </span>
              {file && (
                <span className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(0)} KB
                </span>
              )}
            </button>
          </div>

          {preview && (
            <div className="overflow-hidden rounded-lg border">
              <img src={preview} alt="Preview" className="mx-auto max-h-64 object-contain" />
            </div>
          )}

          {instructionLabel && (
            <div className="space-y-2">
              <Label>{instructionLabel}</Label>
              <Textarea
                placeholder={instructionPlaceholder}
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                className="min-h-[80px] resize-none"
              />
            </div>
          )}

          <GenerationProgress active={busy} estimatedSeconds={estimatedSeconds} label={title} />

          <Button
            onClick={handleGo}
            disabled={busy || !file}
            className="w-full gradient-primary text-primary-foreground"
            size="lg"
          >
            {busy ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Icon className="mr-2 h-5 w-5" />}
            {busy ? "Working…" : ctaLabel}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Tip: press ⌘/Ctrl + Enter to run
          </p>
        </CardContent>
      </Card>

      {(busy || result) && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {preview && (
            <Card>
              <CardContent className="p-4">
                <p className="mb-2 text-sm font-medium text-muted-foreground">Original</p>
                <img src={preview} alt="Original" className="w-full rounded-lg border object-contain" />
              </CardContent>
            </Card>
          )}
          <Card>
            <CardContent className="p-4">
              <p className="mb-2 text-sm font-medium text-muted-foreground">Result</p>
              {busy ? (
                <Skeleton className="aspect-square w-full rounded-lg" />
              ) : result ? (
                <div className="space-y-2">
                  <img src={result} alt="Result" className="w-full rounded-lg border object-contain" />
                  <Button size="sm" variant="outline" className="w-full" onClick={() => download(result)}>
                    <Download className="mr-2 h-4 w-4" /> Download
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
