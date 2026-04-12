import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Wand2, Upload, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function Enhancer() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [instruction, setInstruction] = useState("");
  const [enhancedImage, setEnhancedImage] = useState<string>("");
  const [enhancing, setEnhancing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleEnhance = async () => {
    if (!imagePreview) {
      toast.error("Please upload an image first");
      return;
    }
    setEnhancing(true);
    setEnhancedImage("");
    try {
      const { data, error } = await supabase.functions.invoke("enhance-image", {
        body: { imageUrl: imagePreview, instruction: instruction || undefined },
      });
      if (error) throw error;
      if (data?.image) {
        setEnhancedImage(data.image);
        toast.success("Image enhanced!");
      } else {
        toast.error("No enhanced image returned");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to enhance image");
    } finally {
      setEnhancing(false);
    }
  };

  const handleDownload = (dataUrl: string) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `imageforge-enhanced-${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Wand2 className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">Image Enhancer</h1>
        <p className="mt-2 text-muted-foreground">
          Improve image quality, fix details, and upscale with AI
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label>Upload Image</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="flex-1"
                />
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Enhancement Instructions (optional)</Label>
              <Textarea
                placeholder="e.g. 'Make colors more vibrant', 'Sharpen details', 'Fix lighting'..."
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                className="resize-none"
              />
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleEnhance}
              disabled={enhancing || !imagePreview}
            >
              {enhancing ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-5 w-5" />
              )}
              {enhancing ? "Enhancing..." : "Enhance Image"}
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          {imagePreview && (
            <Card>
              <CardContent className="p-4">
                <p className="mb-2 text-sm font-medium text-muted-foreground">Original</p>
                <div className="overflow-hidden rounded-lg border">
                  <img
                    src={imagePreview}
                    alt="Original"
                    className="w-full object-contain"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {enhancing && (
            <Card>
              <CardContent className="p-4">
                <p className="mb-2 text-sm font-medium text-muted-foreground">Enhanced</p>
                <Skeleton className="aspect-square w-full rounded-lg" />
              </CardContent>
            </Card>
          )}

          {enhancedImage && !enhancing && (
            <Card className="group relative">
              <CardContent className="p-4">
                <p className="mb-2 text-sm font-medium text-muted-foreground">Enhanced</p>
                <div className="relative overflow-hidden rounded-lg border">
                  <img
                    src={enhancedImage}
                    alt="Enhanced"
                    className="w-full object-contain"
                  />
                  <div className="absolute inset-0 flex items-end justify-end bg-gradient-to-t from-black/40 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() => handleDownload(enhancedImage)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
