import { supabase } from "@/integrations/supabase/client";

export async function logActivity(
  userId: string,
  action: string,
  resourceType?: string,
  resourceId?: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  try {
    await supabase.from("activity_log").insert([{
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      metadata: metadata as never,
    }]);
  } catch {
    // non-blocking
  }
}
