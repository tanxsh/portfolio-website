import type { Metadata } from "next";
import ContactsAdmin from "@/components/admin/ContactsAdmin";

export const metadata: Metadata = {
  title: "Contacts Admin",
};

export default function ContactsAdminPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Contacts Admin</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Manage contact submissions.
      </p>
      <ContactsAdmin />
    </div>
  );
}
