/* eslint-disable @next/next/no-img-element */
import { redirect } from "next/navigation";
import { updateProfile } from "@/app/actions";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

type ProfilePageProps = {
  searchParams: Promise<{ error?: string; saved?: string }>;
};

const errorMessages: Record<string, string> = {
  name: "Enter both a first name and a last name.",
  avatar: "Choose a JPG, PNG, WEBP, or GIF smaller than 5 MB.",
  upload: "The profile photo could not be uploaded.",
  save: "The profile could not be saved.",
};

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;

  if (!claims?.sub) {
    redirect("/login");
  }

  const { data } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, avatar_path, updated_at")
    .eq("id", claims.sub)
    .maybeSingle();

  const profile = data as Profile | null;
  const email = typeof claims.email === "string" ? claims.email : "";
  const incomplete = !profile?.first_name || !profile?.last_name;
  const { error, saved } = await searchParams;
  const avatarUrl = profile?.avatar_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${profile.avatar_path}?v=${encodeURIComponent(profile.updated_at)}`
    : null;

  return (
    <div className="page">
      <SiteHeader signedIn email={email} />
      <main className="interior-page">
        <section className="profile-intro">
          <p className="eyebrow">Identity record</p>
          <h1 className="interior-title">
            YOUR PROFILE<span className="period">.</span>
          </h1>
          <p className="panel-copy">
            {incomplete
              ? "Complete your name before entering the Caption Arena."
              : "Update the identity attached to your Caption Arena account."}
          </p>
        </section>

        <section className="profile-grid" aria-label="Profile editor">
          <div className="avatar-panel">
            {avatarUrl ? (
              <img className="avatar-preview" src={avatarUrl} alt="Your profile" />
            ) : (
              <div className="avatar-placeholder" aria-hidden="true">
                {(profile?.first_name?.[0] ?? email[0] ?? "?").toUpperCase()}
              </div>
            )}
            <p>{email}</p>
          </div>

          <form className="profile-form" action={updateProfile}>
            {incomplete ? (
              <p className="form-message form-notice">First name and last name are required.</p>
            ) : null}
            {saved ? <p className="form-message form-success">Profile saved.</p> : null}
            {error ? (
              <p className="form-message form-error" role="alert">
                {errorMessages[error] ?? "Something went wrong."}
              </p>
            ) : null}

            <div className="field-row">
              <label>
                <span>First name</span>
                <input name="first_name" defaultValue={profile?.first_name ?? ""} maxLength={80} autoComplete="given-name" required />
              </label>
              <label>
                <span>Last name</span>
                <input name="last_name" defaultValue={profile?.last_name ?? ""} maxLength={80} autoComplete="family-name" required />
              </label>
            </div>

            <label>
              <span>Profile photo</span>
              <input name="avatar" type="file" accept="image/jpeg,image/png,image/webp,image/gif" />
              <small>JPG, PNG, WEBP, or GIF · 5 MB maximum</small>
            </label>

            <button className="primary-button" type="submit">Save profile</button>
          </form>
        </section>
      </main>
    </div>
  );
}
