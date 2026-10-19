import Link from "next/link";
import { signOut } from "@/app/actions";
import { NavLinks } from "@/components/nav-links";

type SiteHeaderProps = {
  signedIn: boolean;
  email?: string;
};

const MEMBER_LINKS = [
  { href: "/", label: "Archive", icon: "▦" },
  { href: "/vote", label: "Judge", icon: "⚖" },
  { href: "/create", label: "Create", icon: "✦" },
  { href: "/profile", label: "Profile", icon: "◉" },
];
const GUEST_LINKS = [
  { href: "/", label: "Archive", icon: "▦" },
  { href: "/login", label: "Sign in", icon: "→" },
];

export function SiteHeader({ signedIn, email }: SiteHeaderProps) {
  const links = signedIn ? MEMBER_LINKS : GUEST_LINKS;
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="masthead">
        <Link className="brand" href="/" aria-label="Caption Archive home">
          <span className="brand-mark" aria-hidden="true">CA</span>
          <span className="brand-name glitch-small" data-text="Caption Archive">Caption Archive</span>
        </Link>

        {signedIn ? <NavLinks className="site-nav" items={links.filter((link) => link.href !== "/profile")} /> : <span className="header-tagline">AI captions · you judge</span>}

        <div className="header-actions">
          {signedIn ? (
            <>
              <Link className="user-chip" href="/profile" title={email ? `Signed in as ${email}` : "Your profile"}>
                <span className="user-initial" aria-hidden="true">{(email?.[0] ?? "?").toUpperCase()}</span>
                <span className="user-label">Profile</span>
              </Link>
              <form action={signOut}>
                <button className="nav-button" type="submit">Sign out</button>
              </form>
            </>
          ) : (
            <Link className="header-cta" href="/login">Sign in</Link>
          )}
        </div>
      </header>
      <NavLinks className="tabbar" items={links} />
    </>
  );
}
