import { DexieError } from "dexie";
import { useLiveQuery } from "dexie-react-hooks";
import { diff } from "just-diff";
import { Event, relayPool } from "nostr-tools";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSnapshot } from "valtio";
import { db, getAllChats } from "../models/db";
import { NostrEvent } from "../models/NostrEvent";
import { state } from "../state";

export const pool = relayPool();

export default function NostrSocket() {
  const snap = useSnapshot(state);
  const allChats = useLiveQuery(
    () => getAllChats(snap.publicKey),
    [snap.privateKey]
  );
  // Ref used otherwise events get lost in useEffect
  const events = useRef<NostrEvent[]>([]);

  // Data flush
  useMemo(() => {
    const flush = async () => {
      if (events.current.length == 0) return;
      try {
        // NOTE: Even only some events succeed but not all it will throw
        await db.nostrEvents.bulkAdd(events.current);
      } catch (e: DexieError) {
        // We don't care about key already exists errors but other stuff might be important to log
        if (e.failures.filter((f) => f.name !== "ConstraintError").length > 0)
          console.error(e.message);
      } finally {
        events.current = [];
      }
    };

    const timer = setInterval(flush, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  // Keep the pool private key updated
  useEffect(() => {
    if (!snap.privateKey) return;
    pool.setPrivateKey(snap.privateKey);
  }, [snap.privateKey]);

  // Keep relay connections updated
  useEffect(() => {
    if (!snap.privateKey) return;
    // Add / remove relays accordingly
    const poolUrls = Object.keys(pool.relays);
    let difference = diff(poolUrls, [...snap.relays]);

    for (let diff of difference) {
      switch (diff.op) {
        case "add":
          pool.addRelay(diff.value);
          break;
        case "remove":
          pool.removeRelay(poolUrls[diff.path[0] as number]);
          break;
        case "replace":
          // Skip if asking to replace something that is already in the array but not in
          // the diff expected position
          if (poolUrls.includes(diff.value)) return;
          // Otherwise remove + add accordingly
          pool.removeRelay(poolUrls[diff.path[0] as number]);
          pool.addRelay(diff.value);
          break;
      }
    }
  }, [snap.relays, snap.privateKey]);

  // Subscribe to incoming and outgoing chat
  useEffect(() => {
    if (!snap.privateKey) return;
    const incomingChatSub = pool.sub({
      cb: async (event) =>
        (events.current = [...events.current, event as NostrEvent]),
      skipVerification: true,
      filter: {
        kinds: [4],
        "#p": [snap.publicKey],
      },
    });

    const outgoingChatSub = pool.sub({
      cb: async (event) =>
        (events.current = [...events.current, event as NostrEvent]),
      skipVerification: true,
      filter: {
        authors: [snap.publicKey],
        kinds: [4],
      },
    });

    return () => {
      incomingChatSub.unsub();
      outgoingChatSub.unsub();
    };
  }, [snap.relays, snap.privateKey]);

  useEffect(() => {
    if (!snap.privateKey || !allChats) return;
    let subs: any[] = [];
    Object.keys(allChats)
      .concat([snap.publicKey])
      .forEach((pubkey) => {
        const sub = pool.sub({
          cb: async (event: Event) => {
            // TODO: This ought to go into indexedb
            const { name, picture, about } = JSON.parse(event.content);
            const profile = snap.profiles[pubkey];
            if (profile?.updatedAt >= event.created_at) return;
            state.profiles = {
              ...state.profiles,
              [pubkey]: { name, about, picture, updatedAt: event.created_at },
            };
          },
          skipVerification: true,
          filter: {
            authors: [pubkey],
            kinds: [0],
            limit: 1,
          },
        });
        subs.push(sub);
      });

    return () => {
      subs.forEach((sub) => sub.unsub());
    };
  }, [snap.privateKey, snap.relays, allChats]);

  return <></>;
}
