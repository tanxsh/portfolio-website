"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addToOutbox,
  loadOutbox,
  markAttempt,
  removeFromOutbox,
  type LoadOutboxResult,
  type OutboxItem,
} from "./outbox";

export type OutboxRetryResult = "sent" | "invalid" | "failed";

export type OutboxFields = {
  name: string;
  email: string;
  message: string;
};

function readOutbox(): LoadOutboxResult {
  try {
    return loadOutbox(window.localStorage);
  } catch {
    return { items: [], discarded: 0 };
  }
}

export default function useOutbox(endpoint: string) {
  const [items, setItems] = useState<OutboxItem[]>([]);
  const [discarded, setDiscarded] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const result = readOutbox();
      if (!cancelled) {
        setItems(result.items);
        setDiscarded(result.discarded);
        setReady(true);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(() => {
    setItems(readOutbox().items);
  }, []);

  const queue = useCallback(
    (fields: OutboxFields) => {
      try {
        addToOutbox(window.localStorage, fields);
      } catch {
        // Storage blocked or full — keep the UI working without persistence.
      }
      refresh();
    },
    [refresh],
  );

  const discard = useCallback(
    (id: string) => {
      try {
        removeFromOutbox(window.localStorage, id);
      } catch {
        // Storage blocked — refresh from whatever we can read.
      }
      refresh();
    },
    [refresh],
  );

  const retry = useCallback(
    async (id: string): Promise<OutboxRetryResult> => {
      const item = readOutbox().items.find(
        (candidate) => candidate.id === id,
      );

      if (!item) {
        return "failed";
      }

      try {
        try {
          markAttempt(window.localStorage, id);
        } catch {
          // Storage blocked — still attempt the send.
        }
        refresh();

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: item.name,
            email: item.email,
            message: item.message,
          }),
        });

        if (response.ok) {
          try {
            removeFromOutbox(window.localStorage, id);
          } catch {
            // Storage blocked — item stays queued locally.
          }
          refresh();
          return "sent";
        }

        if (response.status === 400) {
          return "invalid";
        }

        return "failed";
      } catch {
        return "failed";
      }
    },
    [endpoint, refresh],
  );

  const retryAll = useCallback(async () => {
    const snapshot = readOutbox().items;

    for (const item of snapshot) {
      await retry(item.id);
    }
  }, [retry]);

  useEffect(() => {
    function onOnline() {
      void retryAll();
    }

    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [retryAll]);

  return { items, discarded, ready, queue, retry, discard, retryAll };
}
