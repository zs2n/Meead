import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function getAdminCounts() {
  const supabase = await createClient();
  const [offices, reviews, messages] = await Promise.all([
    supabase.from("offices").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("reviews").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("handled", false),
  ]);
  return {
    pendingOffices: offices.count ?? 0,
    pendingReviews: reviews.count ?? 0,
    newMessages: messages.count ?? 0,
  };
}
