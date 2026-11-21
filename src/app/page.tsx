import Link from "next/link";

export default function Home() {
  return (
    <section className="hero">
      <div className="mx-auto w-full max-w-4xl px-6 py-20 sm:py-28">
        <p className="text-sm font-medium uppercase tracking-widest text-accent">
          MS Business Analytics · Santa Clara University
        </p>
        <h1 className="mt-3 max-w-xl text-4xl font-bold tracking-tight sm:text-5xl">
          Tanish Jagadheshan
        </h1>
        <p className="mt-4 max-w-xl text-2xl font-medium leading-snug tracking-tight sm:text-3xl">
          I build <span className="text-accent">AI applications</span> that turn
          raw data into decisions.
        </p>
        <p className="mt-6 max-w-2xl text-base leading-7 text-muted sm:text-lg sm:leading-8">
          I&apos;m a Business Analytics master&apos;s student at Santa Clara
          University, graduating in December 2026, with a B.Tech in Electronics
          and Instrumentation Engineering from Manipal Institute of Technology.
          My focus is practical AI: retrieval-augmented generation, multi-agent
          systems, and the APIs and data pipelines that make them usable.
        </p>
        <div className="mt-9 flex flex-wrap gap-4">
          <Link href="/projects" className="btn-primary">
            View Projects
          </Link>
          <Link href="/contact-me" className="btn-secondary">
            Get in Touch
          </Link>
        </div>
      </div>
    </section>
  );
}
