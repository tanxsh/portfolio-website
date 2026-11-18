import type { Metadata } from "next";
import RadarAdmin from "@/components/admin/RadarAdmin";

export const metadata: Metadata = {
  title: "Radar Admin",
};

export default function RadarAdminPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Radar Admin</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Manage your tech radar.
      </p>
      <RadarAdmin />
    </div>
  );
}
