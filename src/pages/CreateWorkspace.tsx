import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, Sparkles, Briefcase, Palette, Users } from "lucide-react";
import { toast } from "sonner";

const PRESETS = [
  { icon: Sparkles, name: "Personal", desc: "For your own creative projects" },
  { icon: Briefcase, name: "Client Work", desc: "Deliverables for clients" },
  { icon: Palette, name: "Brand Studio", desc: "Marketing and brand assets" },
  { icon: Users, name: "Team Space", desc: "Shared workspace" },
];

export default function CreateWorkspace() {
  const { user } = useAuth();
  const { refresh, workspaces } = useWorkspace();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Give your workspace a name");
      return;
    }
    if (!user) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("workspaces")
      .insert({ user_id: user.id, name: name.trim(), description: description.trim() || null })
      .select()
      .single();
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    localStorage.setItem("flashai:activeWorkspaceId", data.id);
    await refresh();
    toast.success(`Workspace "${data.name}" created`);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Sparkles className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Create your workspace</h1>
          <p className="mt-2 text-muted-foreground">
            {workspaces.length === 0
              ? "You need a workspace before you can start creating."
              : "Add another workspace to organize your work."}
          </p>
        </div>

        <Card className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => setName(p.name)}
                className={`flex items-start gap-2 rounded-lg border p-3 text-left transition-all hover:border-primary hover:bg-primary/5 ${
                  name === p.name ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <p.icon className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <div>
                  <div className="text-sm font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.desc}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ws-name">Workspace name</Label>
            <Input id="ws-name" placeholder="My Studio" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ws-desc">Description (optional)</Label>
            <Textarea id="ws-desc" placeholder="What this workspace is for..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <Button onClick={handleCreate} disabled={saving} className="w-full" size="lg">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Create workspace
          </Button>
          {workspaces.length > 0 && (
            <Button variant="ghost" className="w-full" onClick={() => navigate("/dashboard")}>
              Cancel
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
}
