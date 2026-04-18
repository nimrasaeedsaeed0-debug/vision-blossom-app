import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Bell, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const FEATURE_LABELS: Record<string, string> = {
  "video-generator": "AI Video Generator",
  "avatar-creator": "Avatar Creator",
  "logo-maker": "Logo Maker",
  "mockup-generator": "Mockup Generator",
  "smart-retouch": "Smart Retouch",
  "object-replacer": "Object Replacer",
  "color-grader": "Color Grader",
  "face-swap": "Face Swap",
  resize: "Resize for Platform",
  team: "Team Workspace",
  assets: "Asset Library",
};

export default function ComingSoon() {
  const { feature = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const label = FEATURE_LABELS[feature] || "This feature";
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (!joined) {
      toast.success(`You're on the list! We'll notify you when ${label} launches.`);
      setJoined(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-16 animate-fade-in">
      <Button variant="ghost" size="sm" className="mb-6" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-4 p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <span className="rounded-full border border-primary/20 bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            Beta — Coming Soon
          </span>
          <h1 className="font-heading text-3xl font-bold">{label}</h1>
          <p className="max-w-md text-muted-foreground">
            We're building something amazing. You've been added to the waitlist — we'll email
            you the moment it goes live.
          </p>
          <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-4 py-2 text-sm">
            <Bell className="h-4 w-4 text-primary" />
            You're on the waitlist
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
