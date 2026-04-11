import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export default function Editor() {
  const [searchParams] = useSearchParams();
  const imageUrl = searchParams.get("image") || "";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);

  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropW, setCropW] = useState(0);
  const [cropH, setCropH] = useState(0);

  useEffect(() => {
    if (!imageUrl) return;
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      setImg(image);
      setCropW(image.width);
      setCropH(image.height);
    };
    image.src = imageUrl;
  }, [imageUrl]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const sw = cropW || img.width;
    const sh = cropH || img.height;
    canvas.width = sw;
    canvas.height = sh;

    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    ctx.drawImage(img, cropX, cropY, sw, sh, 0, 0, sw, sh);
  }, [img, brightness, contrast, saturation, cropX, cropY, cropW, cropH]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleReset = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    if (img) {
      setCropX(0);
      setCropY(0);
      setCropW(img.width);
      setCropH(img.height);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `imageforge-edited-${Date.now()}.png`;
    a.click();
    toast.success("Image downloaded!");
  };

  if (!imageUrl) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        No image selected. Generate an image first, then click edit.
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Image Editor</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="overflow-auto rounded-xl border bg-muted/30 p-4">
          <canvas ref={canvasRef} className="mx-auto max-w-full" />
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Brightness: {brightness}%</Label>
                <Slider value={[brightness]} onValueChange={([v]) => setBrightness(v)} min={0} max={200} step={1} />
              </div>
              <div className="space-y-2">
                <Label>Contrast: {contrast}%</Label>
                <Slider value={[contrast]} onValueChange={([v]) => setContrast(v)} min={0} max={200} step={1} />
              </div>
              <div className="space-y-2">
                <Label>Saturation: {saturation}%</Label>
                <Slider value={[saturation]} onValueChange={([v]) => setSaturation(v)} min={0} max={200} step={1} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Crop</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">X</Label>
                <Input type="number" value={cropX} onChange={(e) => setCropX(Number(e.target.value))} min={0} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Y</Label>
                <Input type="number" value={cropY} onChange={(e) => setCropY(Number(e.target.value))} min={0} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Width</Label>
                <Input type="number" value={cropW} onChange={(e) => setCropW(Number(e.target.value))} min={1} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Height</Label>
                <Input type="number" value={cropH} onChange={(e) => setCropH(Number(e.target.value))} min={1} />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button className="flex-1" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
