"use client";

import { useState } from "react";
import type { OutboxItem } from "@/lib/outbox";

type RetryResult = "sent" | "invalid" | "failed";

type OutboxPanelProps = {
  items: OutboxItem[];
  discarded: number;
  ready: boolean;
  onRetry: (id: string) => Promise<RetryResult>;
  onDiscard: (id: string) => void;
  onRetryAll: () => void;
};

const STATUS_TEXT: Record<RetryResult, string> = {
  sent: "Sent",
  invalid: "The server rejected this message",
  failed: "Still failing, try again later",
};

const STATUS_COLOR: Record<RetryResult, string> = {
  sent: "text-emerald-600 dark:text-emerald-400",
  invalid: "text-amber-600 dark:text-amber-400",
  failed: "text-red-600 dark:text-red-400",
};

function truncateMessage(message: string) {
  return message.length > 120
    ? `${message.slice(0, 120).trimEnd()}…`
    : message;
}

function formatQueuedAt(queuedAt: string) {
  return new Date(queuedAt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function OutboxPanel({
  items,
  discarded,
  ready,
  onRetry,
  onDiscard,
  onRetryAll,
}: OutboxPanelProps) {
  const [statuses, setStatuses] = useState<Record<string, RetryResult>>({});
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [retryingAll, setRetryingAll] = useState(false);

  if (!ready) {
    return null;
  }

  async function handleRetry(id: string) {
    setPendingId(id);
    try {
      const result = await onRetry(id);
      setStatuses((previous) => ({ ...previous, [id]: result }));
    } finally {
      setPendingId(null);
    }
  }

  function handleDiscard(id: string) {
    onDiscard(id);
    setStatuses((previous) => {
      const next = { ...previous };
      delete next[id];
      return next;
    });
  }

  async function handleRetryAll() {
    setRetryingAll(true);
    try {
      await onRetryAll();
    } finally {
      setRetryingAll(false);
    }
  }

  return (
    <>
      {discarded > 0 && (
        <p role="status" className="banner-warning mt-8">
          {discarded === 1
            ? "1 saved message on this device was unreadable and was removed."
            : `${discarded} saved messages on this device were unreadable and were removed.`}
        </p>
      )}

      {items.length > 0 && (
        <section className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-medium">Unsent messages</h2>
            {items.length > 1 && (
              <button
                type="button"
                onClick={handleRetryAll}
                disabled={retryingAll}
                className="btn-secondary px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-60"
              >
                {retryingAll ? "Retrying…" : "Retry all"}
              </button>
            )}
          </div>

          <ul className="mt-4 flex flex-col gap-4">
            {items.map((item) => {
              const busy = pendingId === item.id || retryingAll;
              const status = statuses[item.id];

              return (
                <li key={item.id} className="card p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted">{item.email}</p>
                  </div>
                  <p className="mt-1.5 text-sm leading-6 text-muted">
                    {truncateMessage(item.message)}
                  </p>
                  <p className="mt-2 text-xs text-muted">
                    Queued {formatQueuedAt(item.queuedAt)} · Attempts:{" "}
                    {item.attempts}
                  </p>

                  {status && (
                    <p
                      role="status"
                      className={`mt-2 text-xs ${STATUS_COLOR[status]}`}
                    >
                      {STATUS_TEXT[status]}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleRetry(item.id)}
                      disabled={busy}
                      className="btn-primary px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {pendingId === item.id ? "Retrying…" : "Retry"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDiscard(item.id)}
                      disabled={busy}
                      className="btn-secondary px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Discard
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </>
  );
}
