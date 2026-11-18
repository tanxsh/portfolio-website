"use client";

import { useEffect, useState } from "react";
import RadarForm from "@/components/admin/RadarForm";
import type { RadarItem } from "@/lib/radarStore";

export default function RadarAdmin() {
  const [items, setItems] = useState<RadarItem[] | null>(null);
  const [editing, setEditing] = useState<RadarItem | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadItems() {
      try {
        const response = await fetch("/api/radar");
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const data = (await response.json()) as RadarItem[];
        if (!cancelled) {
          setItems(data);
          setListError(null);
        }
      } catch {
        if (!cancelled) {
          setListError("Failed to load radar items. Please try again later.");
        }
      }
    }

    loadItems();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this radar item? This cannot be undone.")) {
      return;
    }

    setBusyId(id);
    try {
      const response = await fetch(`/api/radar/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      if (editing?.id === id) {
        setEditing(null);
      }
      setRefreshKey((key) => key + 1);
    } catch {
      setListError("Failed to delete the radar item. Please try again later.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-2">
      <section>
        <h2 className="text-lg font-medium">
          {editing ? "Edit item" : "New item"}
        </h2>
        <RadarForm
          key={editing?.id ?? "new"}
          item={editing}
          onSaved={() => setRefreshKey((key) => key + 1)}
          onReset={() => setEditing(null)}
        />
      </section>

      <section>
        <h2 className="text-lg font-medium">All items</h2>

        {listError && <p className="banner-error mt-4">{listError}</p>}

        {items === null && !listError && (
          <p className="mt-4 text-muted">Loading items…</p>
        )}

        {items !== null && items.length === 0 && (
          <p className="mt-4 text-muted">No radar items yet</p>
        )}

        {items !== null && items.length > 0 && (
          <ul className="mt-4 flex flex-col gap-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="card flex items-center justify-between gap-4 p-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {item.category} · {item.ring}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing(item)}
                    className="btn-secondary px-4 py-1.5 text-xs"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    disabled={busyId === item.id}
                    className="btn-secondary px-4 py-1.5 text-xs"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
