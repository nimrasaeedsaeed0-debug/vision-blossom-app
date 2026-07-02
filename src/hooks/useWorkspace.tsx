import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  loading: boolean;
  setActiveWorkspace: (w: Workspace) => void;
  refresh: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  workspaces: [],
  activeWorkspace: null,
  loading: true,
  setActiveWorkspace: () => {},
  refresh: async () => {},
});

const ACTIVE_KEY = "flashai:activeWorkspaceId";

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActive] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setWorkspaces([]);
      setActive(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("workspaces")
      .select("id, name, description, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    const list = data || [];
    setWorkspaces(list);
    const savedId = localStorage.getItem(ACTIVE_KEY);
    const found = list.find((w) => w.id === savedId) || list[0] || null;
    setActive(found);
    if (found) localStorage.setItem(ACTIVE_KEY, found.id);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setActiveWorkspace = (w: Workspace) => {
    setActive(w);
    localStorage.setItem(ACTIVE_KEY, w.id);
  };

  return (
    <WorkspaceContext.Provider value={{ workspaces, activeWorkspace, loading, setActiveWorkspace, refresh }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  return useContext(WorkspaceContext);
}
