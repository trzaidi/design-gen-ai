import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { GenerationForm } from "@/components/generation-form";
import { createClient } from "@/lib/supabase/server";
import { dailyScene } from "@/lib/arena";
export const dynamic = "force-dynamic";

export default async function CreatePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user || data.user.is_anonymous) redirect("/login");
  const [profile, requests, allowance] = await Promise.all([
    supabase.from("profiles").select("first_name, last_name").eq("id", data.user.id).maybeSingle(),
    supabase.from("generation_requests").select("id", { count: "exact", head: true }).gte("created_at", new Date(new Date().getTime() - 86_400_000).toISOString()),
    supabase.rpc("generation_daily_limit"),
  ]);
  if (!profile.data?.first_name || !profile.data?.last_name) redirect("/profile");
  const { scene } = dailyScene();
  return <div className="page"><SiteHeader signedIn email={data.user.email} /><main className="interior-page create-page">
    <p className="eyebrow">Make the next contender</p><h1 className="interior-title">MAKE IT FUNNY<span className="period">.</span></h1>
    <p className="panel-copy">Dorm life, subway chaos, or your weekend in the city. Describe a scene, pick a tone, and let AI write the caption. The community decides whether it lands.</p>
    {requests.error || allowance.error ? <p className="database-message" role="alert">The generator could not be loaded. Please try again.</p> : <GenerationForm scene={scene} used={requests.count ?? 0} dailyLimit={allowance.data} />}
  </main></div>;
}
