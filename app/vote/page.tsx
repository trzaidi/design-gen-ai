import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";
import type { Caption, Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function VotePage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;

  if (!claims?.sub) {
    redirect("/login");
  }

  const [profileResult, captionsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, first_name, last_name, avatar_path, updated_at")
      .eq("id", claims.sub)
      .maybeSingle(),
    supabase
      .from("captions")
      .select("id, caption_text, image_description")
      .order("id", { ascending: true }),
  ]);

  const profile = profileResult.data as Profile | null;

  if (!profile?.first_name || !profile?.last_name) {
    redirect("/profile");
  }

  const captions = (captionsResult.data ?? []) as Caption[];
  const email = typeof claims.email === "string" ? claims.email : undefined;

  return (
    <div className="page">
      <SiteHeader signedIn email={email} />
      <main className="interior-page">
        <section className="arena-heading">
          <div>
            <p className="eyebrow">Authenticated route</p>
            <h1 className="interior-title">
              CAPTION ARENA<span className="period">.</span>
            </h1>
          </div>
          <p className="member-badge">Member: {profile.first_name} {profile.last_name}</p>
        </section>
        <p className="panel-copy arena-copy">
          This room is visible only to authenticated users. Caption voting arrives in the next
          stage; the gated interface and verified profile are active now.
        </p>
        {captionsResult.error ? (
          <p className="database-message" role="alert">The arena entries could not be loaded.</p>
        ) : (
          <div className="arena-grid">
            {captions.map((caption, index) => (
              <article className="arena-card" key={caption.id}>
                <div className="card-topline">
                  <span>CONTENDER {String(index + 1).padStart(2, "0")}</span>
                  <span>LOCKED IN</span>
                </div>
                <p className="caption-text">{caption.caption_text}</p>
                <p className="image-description">{caption.image_description}</p>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
