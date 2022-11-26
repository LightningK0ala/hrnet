import { db } from "./db";
import { encrypt, decrypt } from "nostr-tools/nip04";

const user1 = {
  priv: "d3672583d31286903aa7c47c5698ac059eec05ca172a0f00ed19629ace8df5df",
  pub: "9c8e6bcf8438812fe44ccd32ba4208b3c72193a944d7e6f68ff311b48a28523e",
};
const user2 = {
  priv: "a7e418b8c7a755c9dd9489a6fefe63d8bf7c5958752b2ffdb297b7bd25280f1f",
  pub: "d97a344cf02063588769a1a62dc2cbd80104abed6de78033f70870f3fa157539",
};
const user3 = {
  priv: "070ec9decb0c778fde21759170e2d1746c426ad8ffb86e2de249c5f693f888b2",
  pub: "18959355d2627601bafe27dd91730192a52b86dadac8ce85ae380fb25e76a45b",
};

Math.random;

export async function populate() {
  await db.nostrEvents.bulkAdd([
    // DMs
    // {
    //   id: "id1",
    //   content: encrypt(user1.priv, user2.pub, "Hey! How are you?"),
    //   kind: 4,
    //   pubkey: user1.pub,
    //   created_at: (Date.now() / 1000) - 1000,
    //   sig: "sig",
    //   tags: [
    //     ["p", user2.pub]
    //   ]
    // },
    // {
    //   id: "id2",
    //   content: encrypt(user2.priv, user1.pub, "I'm doing good, what about you?"),
    //   kind: 4,
    //   pubkey: user2.pub,
    //   created_at: (Date.now() / 1000) - 900,
    //   sig: "sig",
    //   tags: [
    //     ["p", user1.pub]
    //   ]
    // },
    // {
    //   id: "id1.1",
    //   content: "Second Message",
    //   kind: 4,
    //   pubkey: "d97a344cf02063588769a1a62dc2cbd80104abed6de78033f70870f3fa157539",
    //   created_at: (Date.now() / 1000) - 500,
    //   sig: "sig3",
    //   tags: [
    //     ["p", "9c8e6bcf8438812fe44ccd32ba4208b3c72193a944d7e6f68ff311b48a28523e"]
    //   ]
    // },
    // {
    //   id: "id2",
    //   content: "First Reply",
    //   kind: 4,
    //   pubkey: "9c8e6bcf8438812fe44ccd32ba4208b3c72193a944d7e6f68ff311b48a28523e",
    //   created_at: (Date.now() / 1000) - 1000,
    //   sig: "sig3",
    //   tags: [
    //     ["p", "d97a344cf02063588769a1a62dc2cbd80104abed6de78033f70870f3fa157539"]
    //   ]
    // },
    // {
    //   id: "id3",
    //   content: "First Message",
    //   kind: 4,
    //   pubkey: "d97a344cf02063588769a1a62dc2cbd80104abed6de78033f70870f3fa157539",
    //   created_at: (Date.now() / 1000) - 2000,
    //   sig: "sig3",
    //   tags: [
    //     ["p", "9c8e6bcf8438812fe44ccd32ba4208b3c72193a944d7e6f68ff311b48a28523e"]
    //   ]
    // },
    // {
    //   id: "id4",
    //   content: "DM without reply",
    //   kind: 4,
    //   pubkey: "d97a344cf02063588769a1a62dc2cbd80104abed6de78033f70870f3fa157539",
    //   created_at: (Date.now() / 1000) - 600,
    //   sig: "sig3",
    //   tags: [
    //     ["p", "8d8e6bcf8438812fe44ccd32ba4208b3c72193a944d7e6f68ff311b48a28523f"]
    //   ]
    // },
    // {
    //   id: "id5",
    //   content: "Incoming DM",
    //   kind: 4,
    //   pubkey: "1d8e6bcf8438812fe44ccd32ba4208b3c72193a944d7e6f68ff311b48a28523g",
    //   created_at: (Date.now() / 1000) - 600,
    //   sig: "sig3",
    //   tags: [
    //     ["p", "d97a344cf02063588769a1a62dc2cbd80104abed6de78033f70870f3fa157539"]
    //   ]
    // },
    // {
    //   id: "id2",
    //   content: "Second Event Content",
    //   kind: 4,
    //   pubkey: "pubkey2",
    //   created_at: Date.now(),
    //   sig: "sig2",
    //   tags: []
    // },
  ]);
}
