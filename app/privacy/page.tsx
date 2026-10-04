import { SiteHeader } from "@/components/site-header";

export default function PrivacyPage() {
  return (
    <div className="page">
      <SiteHeader signedIn={false} />
      <main className="centered-page">
        <section className="auth-panel" aria-labelledby="privacy-title">
          <p className="eyebrow">Privacy</p>
          <h1 className="interior-title" id="privacy-title">
            PRIVACY POLICY<span className="period">.</span>
          </h1>
          <p className="panel-copy">
            Caption Archive uses Google sign-in through Supabase to receive your
            name, email address, and profile image. This information is used only
            to create and display your profile inside the application.
          </p>
          <p className="panel-copy">
            Profile information is stored in Supabase. Uploaded profile images
            are stored in Supabase Storage. The application does not sell user
            information or use it for advertising.
          </p>
          <p className="panel-copy">
            You may sign out at any time. This student project does not request
            access to Google Drive, Gmail, contacts, or other Google account data.
          </p>
        </section>
      </main>
    </div>
  );
}
