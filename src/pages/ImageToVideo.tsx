import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Film, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ImageToVideo() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [motionPrompt, setMotionPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!imagePreview) {
      toast.error("Please upload an image first");
      return;
    }
    setGenerating(true);
    setVideoUrl("");

    // Simulated — real implementation would call a video generation API
    try {
      await new Promise((r) => setTimeout(r, 3000));
      toast.info("Image-to-Video generation is a preview feature. Full API integration coming soon.");
      // Placeholder: show the image as a static "video"
      setVideoUrl(imagePreview);
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate video");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Film className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">Image to Video</h1>
        <p className="mt-2 text-muted-foreground">
          Animate your images with AI-powered motion
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

            {imagePreview && (
              <div className="overflow-hidden rounded-lg border">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="mx-auto max-h-64 object-contain"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Motion Description (optional)</Label>
              <Textarea
                placeholder="Describe the motion you want, e.g. 'gentle zoom in with clouds moving'..."
                value={motionPrompt}
                onChange={(e) => setMotionPrompt(e.target.value)}
                className="resize-none"
              />
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleGenerate}
              disabled={generating || !imagePreview}
            >
              {generating ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Film className="mr-2 h-5 w-5" />
              )}
              {generating ? "Generating..." : "Generate Video"}
            </Button>
          </CardContent>
        </Card>

        {videoUrl && (
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-3 text-lg font-semibold">Result</h2>
              <div className="overflow-hidden rounded-lg border bg-muted/30">
                <img
                  src={videoUrl}
                  alt="Generated preview"
                  className="mx-auto max-h-96 object-contain"
                />
              </div>
              <p className="mt-3 text-center text-sm text-muted-foreground">
                Full video generation API integration coming soon. This is a preview of the feature.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
