import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">
        Tanish Jagadheshan
      </h1>
      <p className="mt-3 text-xl text-zinc-600 dark:text-zinc-400">
        MS in Business Analytics student building useful software for the web.
      </p>
      <p className="mt-4 max-w-2xl leading-7 text-zinc-600 dark:text-zinc-400">
        I&apos;m an MS in Business Analytics student at Santa Clara University
        who enjoys turning ideas into working tools — from command-line
        utilities to full web apps. Take a look at what I&apos;ve been building.
      </p>
      <div className="mt-8">
        <Link
          href="/projects"
          className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-80"
        >
          View Projects
        </Link>
      </div>
    </div>
  );
}
