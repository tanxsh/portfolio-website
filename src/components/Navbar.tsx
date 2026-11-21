"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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

const BAR_HREFS = new Set(["/", "/projects", "/radar"]);

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const menuRef = useRef<HTMLDivElement>(null);

  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    function onPointerDown(event: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

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
          Tanish Jagadheshan
        </Link>
        <div className="flex items-center gap-1">
          <ul className="flex items-center justify-end gap-x-1">
            {links
              .filter((link) => BAR_HREFS.has(link.href))
              .map((link) => (
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
          <div ref={menuRef} className="relative">
            <button
              type="button"
              aria-label="Menu"
              aria-expanded={menuOpen}
              aria-controls="navbar-menu"
              onClick={() => setMenuOpen((open) => !open)}
              className="rounded-full p-2 text-muted transition-colors hover:bg-accent-soft hover:text-foreground"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            </button>
            <div
              id="navbar-menu"
              className={`absolute right-0 top-full z-50 mt-2 w-56 origin-top-right rounded-2xl border border-edge bg-surface p-1.5 shadow-lg transition-all duration-150 motion-reduce:transition-none ${
                menuOpen
                  ? "visible scale-100 opacity-100"
                  : "invisible scale-95 opacity-0"
              }`}
            >
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                  className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive(link.href)
                      ? "bg-accent-soft font-medium text-accent"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
