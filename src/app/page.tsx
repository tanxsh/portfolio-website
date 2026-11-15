import Link from "next/link";

export default function Home() {
  return (
    <section className="hero">
      <div className="mx-auto w-full max-w-4xl px-6 py-20 sm:py-28">
        <h1 className="max-w-xl text-4xl font-bold tracking-tight sm:text-5xl">
          Tanish Jagadheshan
        </h1>
        <p className="mt-5 max-w-xl text-2xl font-medium leading-snug tracking-tight sm:text-3xl">
          <span className="text-accent">MS in Business Analytics student</span>{" "}
          building useful software for the web.
        </p>
        <p className="mt-6 max-w-2xl text-base leading-7 text-muted sm:text-lg sm:leading-8">
          I&apos;m an MS in Business Analytics student at Santa Clara
          University who enjoys turning ideas into working tools — from
          command-line utilities to full web apps. Take a look at what
          I&apos;ve been building.
        </p>
        <div className="mt-9 flex flex-wrap gap-4">
          <Link href="/projects" className="btn-primary">
            View Projects
          </Link>
          <Link href="/contact-me" className="btn-secondary">
            Contact Me
          </Link>
        </div>
      </div>
    </section>
  );
}
