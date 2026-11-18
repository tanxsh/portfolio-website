"use client";

import { useEffect, useState } from "react";
import ContactEditForm from "@/components/admin/ContactEditForm";
import { formatDate } from "@/lib/blogFormat";
import type { StoredContact } from "@/lib/contactStore";

export default function ContactsAdmin() {
  const [contacts, setContacts] = useState<StoredContact[] | null>(null);
  const [editing, setEditing] = useState<StoredContact | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadContacts() {
      try {
        const response = await fetch("/api/contact");
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const data = (await response.json()) as StoredContact[];
        if (!cancelled) {
          setContacts(data);
          setListError(null);
        }
      } catch {
        if (!cancelled) {
          setListError(
            "Failed to load contact submissions. Please try again later.",
          );
        }
      }
    }

    loadContacts();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this submission? This cannot be undone.")) {
      return;
    }

    setBusyId(id);
    try {
      const response = await fetch(`/api/contact/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      if (editing?.id === id) {
        setEditing(null);
      }
      setRefreshKey((key) => key + 1);
    } catch {
      setListError(
        "Failed to delete the contact submission. Please try again later.",
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-2">
      <section>
        <h2 className="text-lg font-medium">Edit submission</h2>

        {editing === null && (
          <p className="mt-4 text-muted">Select a submission to edit.</p>
        )}

        {editing !== null && (
          <ContactEditForm
            key={editing.id}
            contact={editing}
            onSaved={() => setRefreshKey((key) => key + 1)}
          />
        )}
      </section>

      <section>
        <h2 className="text-lg font-medium">All submissions</h2>

        {listError && <p className="banner-error mt-4">{listError}</p>}

        {contacts === null && !listError && (
          <p className="mt-4 text-muted">Loading submissions…</p>
        )}

        {contacts !== null && contacts.length === 0 && (
          <p className="mt-4 text-muted">No submissions yet</p>
        )}

        {contacts !== null && contacts.length > 0 && (
          <ul className="mt-4 flex flex-col gap-3">
            {contacts.map((contact) => (
              <li
                key={contact.id}
                className="card flex items-start justify-between gap-4 p-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {contact.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">{contact.email}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">
                    {contact.message}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Submitted {formatDate(contact.submittedAt)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing(contact)}
                    className="btn-secondary px-4 py-1.5 text-xs"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(contact.id)}
                    disabled={busyId === contact.id}
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
