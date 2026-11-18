import type { Metadata } from "next";
import RadarView from "@/components/radar/RadarView";

export const metadata: Metadata = {
  title: "Tech Radar",
};

export default function RadarPage() {
  return (
    <div className="mx-auto w-full max-w-[1500px] px-6 py-8">
      <h1 className="text-center text-3xl font-semibold tracking-tight">
        Tech Radar
      </h1>
      <RadarView />
    </div>
  );
}
