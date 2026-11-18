import type { Metadata } from "next";
import RadarView from "@/components/radar/RadarView";

export const metadata: Metadata = {
  title: "Tech Radar",
};

export default function RadarPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <h1 className="text-3xl font-semibold tracking-tight">Tech Radar</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        What I use, what I&apos;m trying, and what I&apos;m watching.
      </p>
      <RadarView />
    </div>
  );
}
