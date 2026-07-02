import { Navigate, useLocation } from "react-router-dom";
import { useWorkspace } from "@/hooks/useWorkspace";
import { Loader2 } from "lucide-react";

export function WorkspaceGate({ children }: { children: React.ReactNode }) {
  const { workspaces, loading } = useWorkspace();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (workspaces.length === 0 && location.pathname !== "/workspace/create") {
    return <Navigate to="/workspace/create" replace />;
  }

  return <>{children}</>;
}
