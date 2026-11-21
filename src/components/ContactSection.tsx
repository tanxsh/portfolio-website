"use client";

import ContactForm from "@/components/ContactForm";
import OutboxPanel from "@/components/OutboxPanel";
import useOutbox from "@/lib/useOutbox";

type ContactSectionProps = {
  endpoint: string;
};

export default function ContactSection({ endpoint }: ContactSectionProps) {
  // The hook runs once here so the form and the panel share one list; data flows down to both as props.
  const outbox = useOutbox(endpoint);

  return (
    <>
      <ContactForm endpoint={endpoint} onQueue={outbox.queue} />
      <OutboxPanel
        items={outbox.items}
        discarded={outbox.discarded}
        ready={outbox.ready}
        onRetry={outbox.retry}
        onDiscard={outbox.discard}
        onRetryAll={outbox.retryAll}
      />
    </>
  );
}
