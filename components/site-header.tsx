import Link from "next/link";
import { signOut } from "@/app/actions";

type SiteHeaderProps = {
  signedIn: boolean;
  email?: string;
};

export function SiteHeader({ signedIn, email }: SiteHeaderProps) {
  return (
    <header className="masthead">
      <Link className="course glitch-small" data-text="Design for Generative AI" href="/">
        Design for Generative AI
      </Link>

      <nav className="site-nav" aria-label="Primary navigation">
        <Link href="/">Archive</Link>
        {signedIn ? (
          <>
            <Link href="/vote">Vote</Link>
            <Link href="/profile">Profile</Link>
            <form action={signOut}>
              <button className="nav-button" type="submit">Sign out</button>
            </form>
          </>
        ) : (
          <Link href="/login">Sign in</Link>
        )}
      </nav>

      <span className="course-number">{signedIn && email ? email : "COMS 6901 / 6998"}</span>
    </header>
  );
}
