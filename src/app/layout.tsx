import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import "./globals.css";

function NavbarFallback() {
  return (
    <header className="sticky top-0 z-50 border-b border-edge bg-background/80 backdrop-blur">
      <nav className="mx-auto w-full max-w-4xl px-6 py-3">
        <span className="text-lg font-semibold tracking-tight">
          My Portfolio
        </span>
      </nav>
    </header>
  );
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Portfolio",
    template: "%s | Portfolio",
  },
  description: "A personal portfolio built with Next.js.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Suspense fallback={<NavbarFallback />}>
          <Navbar />
        </Suspense>
        <main className="flex flex-1 flex-col">{children}</main>
        <footer className="border-t border-edge">
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-2 px-6 py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
            <p className="font-medium text-foreground">Tanish Jagadheshan</p>
            <div className="flex gap-5 text-sm">
              <a
                href="https://www.linkedin.com/in/tanish-j"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent hover:underline"
              >
                LinkedIn
              </a>
              <a
                href="https://github.com/tanxsh/portfolio-website"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent hover:underline"
              >
                GitHub
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
