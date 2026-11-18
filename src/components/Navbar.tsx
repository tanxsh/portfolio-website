"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/about-me", label: "About Me" },
  { href: "/projects", label: "Projects" },
  { href: "/radar", label: "Tech Radar" },
  { href: "/blogs", label: "Blogs" },
  { href: "/contact-me", label: "Contact Me" },
  { href: "/contact-me-server-form", label: "Contact (Server Form)" },
  { href: "/admin", label: "Admin" },
];

export default function Navbar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function linkClass(href: string) {
    return isActive(href)
      ? "rounded-full bg-accent-soft px-3 py-1.5 text-sm font-medium text-accent"
      : "rounded-full px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-edge bg-background/80 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-6 py-3">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-foreground"
        >
          My Portfolio
        </Link>
        <ul className="flex flex-wrap items-center justify-end gap-x-1 gap-y-1">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`${linkClass(link.href)}${
                  link.href === "/radar" ? " radar-pulse" : ""
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
