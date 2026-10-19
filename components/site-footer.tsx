import Link from "next/link";

export function SiteFooter() {
  return <footer className="site-footer">
    <div><strong>Caption Archive</strong><span>AI writes the punchline. You decide if it lands.</span></div>
    <nav aria-label="Footer navigation">
      <Link href="/">Archive</Link>
      <Link href="/vote">Judge</Link>
      <Link href="/create">Create</Link>
      <Link href="/credits">Credits</Link>
      <Link href="/privacy">Privacy</Link>
    </nav>
    <span>Tai Zaidi · Columbia University · 2026</span>
  </footer>;
}
