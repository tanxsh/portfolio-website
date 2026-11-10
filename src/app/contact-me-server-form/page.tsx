import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Me",
};

export default function ContactMeServerFormPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Contact Me</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Send me a message and I&apos;ll get back to you.
      </p>
      <ContactForm />
    </div>
  );
}
