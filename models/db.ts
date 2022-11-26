import Dexie, { Table } from "dexie";
import { NostrEvent } from "./NostrEvent";
import { populate } from "./populate";
import { decrypt } from "nostr-tools/nip04";
import { state } from "../state";

export class AppDB extends Dexie {
  nostrEvents!: Table<NostrEvent, number>;
  constructor() {
    super("AppDB");
    this.version(1).stores({
      nostrEvents: "++id, [pubkey+kind], pubkey, kind, tags, created_at",
    });
  }

  addEvent(event: NostrEvent) {
    this.nostrEvents.add(event);
  }
}

export const db = new AppDB();

db.on("populate", populate);

export function resetDatabase() {
  return db.transaction("rw", db.nostrEvents, async () => {
    await Promise.all(db.tables.map((table) => table.clear()));
    await populate();
  });
}

export function addEvent(event: NostrEvent) {
  return db.nostrEvents.add(event);
}

export function getEventsCount() {
  return db.nostrEvents.count();
}

export function getAllEvents() {
  return db.nostrEvents.toCollection().reverse().sortBy("created_at");
}

export function getLatestEvent() {
  return db.nostrEvents.orderBy("created_at").last();
}

// Dumb way to query all data in the database and post-process it to get latest chat.
// In order to optimize this with Dexie the db schema needs to be modified because it can't be done by
// querying the raw events dataset. Some db architecting required for this.
export async function getAllChats(pubkey: string) {
  const allChat = await db.nostrEvents
    .where("kind")
    .equals(4)
    .sortBy("created_at");
  const filteredChats = allChat.filter((c) => {
    const isInPubkey = c.pubkey == pubkey;
    const isInTag =
      c.tags.filter((t) => t[0] == "p" && t[1] == pubkey).length > 0;
    return isInPubkey || isInTag;
  });
  // Index chats in object by the other side's pubkey
  const groupedChats = filteredChats.reduce((prev, current) => {
    let otherPubkey;
    if (current.pubkey == pubkey) {
      otherPubkey = current.tags.find((t) => t[0] == "p")[1];
    } else {
      otherPubkey = current.pubkey;
    }
    return {
      ...prev,
      [otherPubkey]: [
        ...(prev[otherPubkey] || []),
        {
          ...current,
          content: decrypt(state.privateKey, otherPubkey, current.content),
        },
      ],
    };
  }, []);
  return groupedChats;
}

// Get chat between 2 pubkeys
export async function getChat(ourPubkey: string, theirPubkey: string) {
  // Sucks to query all data here but without denormalizing db table we can't do it otherwise.
  const allChat = await db.nostrEvents
    .where("kind")
    .equals(4)
    .sortBy("created_at");
  return allChat
    .filter((c) => {
      const isOutgoing =
        c.pubkey == ourPubkey &&
        c.tags.filter((t) => t[0] == "p" && t[1] == theirPubkey).length > 0;
      const isIncoming =
        c.pubkey == theirPubkey &&
        c.tags.filter((t) => t[0] == "p" && t[1] == ourPubkey).length > 0;
      return isOutgoing || isIncoming;
    })
    .map((c) => {
      return {
        ...c,
        content: decrypt(state.privateKey, theirPubkey, c.content),
      };
    });
}

// DEBUG
window.getChat = getChat;
window.getAllChats = getAllChats;
window.db = db;
