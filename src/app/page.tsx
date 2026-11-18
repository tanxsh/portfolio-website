import Link from "next/link";

const highlights = [
  {
    title: "AI applications",
    text: "RAG pipelines and multi-agent systems built with LangChain, LangGraph and ChromaDB.",
  },
  {
    title: "Data and ML",
    text: "From ETL pipelines to XGBoost models, including a winning entry in SCU's Spring 2026 Analytics Showdown.",
  },
  {
    title: "Real-world experience",
    text: "A practicum at Alphabet (Google) building a treasury risk intelligence platform, and a data systems internship at IMPAQTO Labs.",
  },
];

const skills = [
  "Python",
  "SQL",
  "R",
  "LangChain",
  "LangGraph",
  "ChromaDB",
  "FastAPI",
  "XGBoost",
  "React",
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="mx-auto w-full max-w-4xl px-6 py-20 sm:py-28">
          <p className="text-sm font-medium uppercase tracking-widest text-accent">
            MS Business Analytics · Santa Clara University
          </p>
          <h1 className="mt-3 max-w-xl text-4xl font-bold tracking-tight sm:text-5xl">
            Tanish Jagadheshan
          </h1>
          <p className="mt-4 max-w-xl text-2xl font-medium leading-snug tracking-tight sm:text-3xl">
            I build <span className="text-accent">AI applications</span> that
            turn raw data into decisions.
          </p>
          <p className="mt-6 max-w-2xl text-base leading-7 text-muted sm:text-lg sm:leading-8">
            I&apos;m a Business Analytics master&apos;s student at Santa Clara
            University, graduating in December 2026, with a B.Tech in
            Electronics and Instrumentation Engineering from Manipal Institute
            of Technology. My focus is practical AI: retrieval-augmented
            generation, multi-agent systems, and the APIs and data pipelines
            that make them usable.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link href="/projects" className="btn-primary">
              View Projects
            </Link>
            <Link href="/contact-me" className="btn-secondary">
              Get in Touch
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-5 text-sm">
            <a
              href="https://github.com/tanxsh"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-accent hover:underline"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/tanish-j"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-accent hover:underline"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </section>
      <Highlights />
    </>
  );
}

function Highlights() {
  return (
    <section className="container-page pt-0">
      <div className="grid gap-4 sm:grid-cols-3">
        {highlights.map((highlight) => (
          <div key={highlight.title} className="card">
            <h2 className="text-base font-medium text-foreground">
              {highlight.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              {highlight.text}
            </p>
          </div>
        ))}
      </div>
      <ul className="mt-10 flex flex-wrap gap-2">
        {skills.map((skill) => (
          <li key={skill} className="pill">
            {skill}
          </li>
        ))}
      </ul>
    </section>
  );
}
