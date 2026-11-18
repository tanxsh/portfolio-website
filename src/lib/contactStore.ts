import path from "node:path";
import { readJsonArrayFile, writeJsonArrayFile } from "./jsonFileStore";

export type StoredContact = {
  id: string;
  name: string;
  email: string;
  message: string;
  submittedAt: string;
};

const defaultDataDir = path.join(process.cwd(), "data");

export async function appendContact(
  contact: Omit<StoredContact, "id" | "submittedAt">,
  dataDir: string = defaultDataDir,
): Promise<StoredContact> {
  const contactsFile = path.join(dataDir, "contacts.json");
  const contacts = await readJsonArrayFile<StoredContact>(contactsFile);

  const stored: StoredContact = {
    id: crypto.randomUUID(),
    ...contact,
    submittedAt: new Date().toISOString(),
  };

  contacts.push(stored);
  await writeJsonArrayFile(contactsFile, contacts);

  return stored;
}

export async function listContacts(
  dataDir: string = defaultDataDir,
): Promise<StoredContact[]> {
  return readJsonArrayFile<StoredContact>(path.join(dataDir, "contacts.json"));
}

export async function getContactById(
  id: string,
  dataDir: string = defaultDataDir,
): Promise<StoredContact | undefined> {
  const contacts = await listContacts(dataDir);
  return contacts.find((contact) => contact.id === id);
}

export async function updateContact(
  id: string,
  fields: Omit<StoredContact, "id" | "submittedAt">,
  dataDir: string = defaultDataDir,
): Promise<StoredContact | undefined> {
  const contactsFile = path.join(dataDir, "contacts.json");
  const contacts = await readJsonArrayFile<StoredContact>(contactsFile);

  const index = contacts.findIndex((contact) => contact.id === id);
  if (index === -1) {
    return undefined;
  }

  const updated: StoredContact = {
    ...contacts[index],
    name: fields.name,
    email: fields.email,
    message: fields.message,
  };

  contacts[index] = updated;
  await writeJsonArrayFile(contactsFile, contacts);

  return updated;
}

export async function deleteContact(
  id: string,
  dataDir: string = defaultDataDir,
): Promise<boolean> {
  const contactsFile = path.join(dataDir, "contacts.json");
  const contacts = await readJsonArrayFile<StoredContact>(contactsFile);

  const remaining = contacts.filter((contact) => contact.id !== id);
  if (remaining.length === contacts.length) {
    return false;
  }

  await writeJsonArrayFile(contactsFile, remaining);
  return true;
}
