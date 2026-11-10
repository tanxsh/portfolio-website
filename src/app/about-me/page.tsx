import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Me",
};

const skills = [
  "TypeScript",
  "JavaScript",
  "Python",
  "React",
  "Next.js",
  "Node.js",
  "SQL",
  "Git",
];

export default function AboutMePage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">About Me</h1>

      <h2 className="mt-8 text-lg font-medium">Bio</h2>
      <p className="mt-2 max-w-2xl leading-7 text-zinc-600 dark:text-zinc-400">
        I&apos;m Tanish Jagadheshan, an Information Systems student at Santa Clara
        University. I like building software that solves everyday problems —
        small tools, web apps, and data-driven dashboards. Away from the
        keyboard, I enjoy hiking and pick-up basketball.
      </p>

      <h2 className="mt-8 text-lg font-medium">Skills</h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {skills.map((skill) => (
          <li
            key={skill}
            className="rounded-full border border-zinc-300 px-3 py-1 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
          >
            {skill}
          </li>
        ))}
      </ul>

      <h2 className="mt-8 text-lg font-medium">Education</h2>
      <p className="mt-2 max-w-2xl leading-7 text-zinc-600 dark:text-zinc-400">
        B.S. in Information Systems — Santa Clara University
      </p>
    </div>
  );
}
