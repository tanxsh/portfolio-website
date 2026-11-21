export const OUTBOX_KEY = "portfolio.contactOutbox.v1";

export type OutboxItem = {
  id: string;
  name: string;
  email: string;
  message: string;
  queuedAt: string;
  attempts: number;
};

export type OutboxStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export type LoadOutboxResult = {
  items: OutboxItem[];
  discarded: number;
};

function isOutboxItem(value: unknown): value is OutboxItem {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.email === "string" &&
    typeof candidate.message === "string" &&
    typeof candidate.queuedAt === "string" &&
    typeof candidate.attempts === "number" &&
    Number.isFinite(candidate.attempts)
  );
}

export function loadOutbox(storage: OutboxStorage): LoadOutboxResult {
  let raw: string | null;

  try {
    raw = storage.getItem(OUTBOX_KEY);
  } catch {
    return { items: [], discarded: 0 };
  }

  if (raw === null || raw === "") {
    return { items: [], discarded: 0 };
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return { items: [], discarded: 1 };
  }

  if (!Array.isArray(parsed)) {
    return { items: [], discarded: 1 };
  }

  const items: OutboxItem[] = [];
  let discarded = 0;

  for (const entry of parsed) {
    if (isOutboxItem(entry)) {
      items.push(entry);
    } else {
      discarded += 1;
    }
  }

  return { items, discarded };
}

export function saveOutbox(
  storage: OutboxStorage,
  items: OutboxItem[],
): boolean {
  try {
    storage.setItem(OUTBOX_KEY, JSON.stringify(items));
    return true;
  } catch {
    return false;
  }
}

export function addToOutbox(
  storage: OutboxStorage,
  fields: { name: string; email: string; message: string },
): OutboxItem {
  const item: OutboxItem = {
    id: crypto.randomUUID(),
    name: fields.name,
    email: fields.email,
    message: fields.message,
    queuedAt: new Date().toISOString(),
    attempts: 0,
  };

  const { items } = loadOutbox(storage);
  items.push(item);
  saveOutbox(storage, items);

  return item;
}

export function removeFromOutbox(storage: OutboxStorage, id: string): void {
  const { items } = loadOutbox(storage);
  saveOutbox(
    storage,
    items.filter((item) => item.id !== id),
  );
}

export function markAttempt(storage: OutboxStorage, id: string): void {
  const { items } = loadOutbox(storage);
  saveOutbox(
    storage,
    items.map((item) =>
      item.id === id ? { ...item, attempts: item.attempts + 1 } : item,
    ),
  );
}
