"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string; icon: string };

export function NavLinks({ items, className }: { items: NavItem[]; className: string }) {
  const pathname = usePathname();
  return <nav className={className} aria-label={className === "tabbar" ? "Quick navigation" : "Primary navigation"}>
    {items.map((item) => {
      const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
      return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}>
        <span className="nav-icon" aria-hidden="true">{item.icon}</span><span>{item.label}</span>
      </Link>;
    })}
  </nav>;
}
