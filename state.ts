import clone from "just-clone";
import remove from "just-remove";
import { getPublicKey } from "nostr-tools";
import { proxy, subscribe } from "valtio";
import { z } from "zod";
import { pool } from "./components/NostrSocket";
import { getRoboHashUrl } from "./utils";

const LOCAL_STORAGE_KEY = "app-state";
const DEFAULT_RELAYS = [
  "wss://nostr.onsats.org",
  // "wss://nostr-pub.wellorder.net",
  // "wss://nostr.bitcoiner.social",
  // "wss://nostr-relay.wlvs.space"
];

const ProfileSchema = z.object({
  name: z.optional(z.string()),
  about: z.optional(z.string()),
  picture: z.optional(z.string()),
  updatedAt: z.number(),
});

const AccountSchema = z.object({
  privkey: z.string(),
  pubkey: z.string(),
});

// Zod typed schema definition for app state
const StateSchema = z.object({
  theme: z.enum(["dark", "default"]),
  onboarded: z.boolean(),
  nostrLatestEventCreatedAt: z.number(),
  privateKey: z.string(),
  publicKey: z.string(),
  // TODO: Remove this from here so it doesn't persist to local storage?
  // Better yet, export it directly from NostrSocket component or use context?
  pool: z.any(),
  relays: z.array(z.string()),
  // TODO: Figure out how to write schema for associative array (object) with dynamic keys.
  profiles: z.record(ProfileSchema),
  readMessagesIds: z.array(z.string()),
  accounts: z.array(AccountSchema),
  devMode: z.boolean()
});

// Infer state type
type StateType = z.infer<typeof StateSchema>;

// Default state if none in local storage
const defaultState: StateType = {
  theme: "dark",
  onboarded: false,
  nostrLatestEventCreatedAt: 0,
  // TODO: Remove this
  // const privKey = "d3672583d31286903aa7c47c5698ac059eec05ca172a0f00ed19629ace8df5df"
  // const pubKey = "9c8e6bcf8438812fe44ccd32ba4208b3c72193a944d7e6f68ff311b48a28523e"
  privateKey: "",
  publicKey: "",
  pool: undefined,
  relays: DEFAULT_RELAYS,
  profiles: {},
  readMessagesIds: [],
  accounts: [],
  devMode: false
};

// Retrieve from LocalStorage, parse and use default state if necessary
const storedStateString = localStorage.getItem(LOCAL_STORAGE_KEY);

// NOTE: This parse here will throw if local storage doesn't pass validation
// Need to handle this gracefully.
let initialState: StateType;
try {
  if (storedStateString) {
    initialState = JSON.parse(storedStateString);
    // Use zod parsing to check for errors?
    // initialState = StateSchema.parse(JSON.parse(storedStateString))
  } else {
    initialState = defaultState;
  }
} catch (e) {
  console.error("Zod Error", e);
  initialState = defaultState;
}
// const initialState = storedStateString ? StateSchema.parse(JSON.parse(storedStateString)) : defaultState

// Setup valtio state
export let state = proxy<StateType>(initialState);

// Sync to local storage on every change
subscribe(state, () =>
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state))
);

// Actions

export const setNostrLatestEventCreatedAt = (created_at: number) => {
  state.nostrLatestEventCreatedAt = created_at;
};

export const addAccount = (privkey: string) => {
  if (state.accounts.filter((a) => a.privkey == privkey).length == 0) {
    // @ts-ignore
    const pubkey = getPublicKey(privkey);
    state.accounts = [...state.accounts, { privkey, pubkey }];
  } else {
    throw new Error("Account already exists");
  }
};

export const deleteAccountByIndex = (index: number) => {
  const remainingAccounts = state.accounts.filter((_value, i) => i !== index);
  const firstRemainingAccount = remainingAccounts[0];
  setPrivateKey(firstRemainingAccount.privkey);
  state.accounts = remainingAccounts;
};

export const setPrivateKey = (privkey: string) => {
  state.privateKey = privkey;
  pool.setPrivateKey(privkey);
  try {
    // @ts-ignore
    state.publicKey = getPublicKey(privkey);
  } catch (e) {
    state.publicKey = "";
  }
};

export const resetState = () => {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
  // Clone is necessary? https://github.com/pmndrs/valtio/issues/225
  const resetObj = clone(defaultState);
  Object.keys(resetObj).forEach((key) => {
    // Skip resetting relays
    if (key == "relays") return;
    // @ts-ignore
    state[key] = resetObj[key];
  });
};

export const resetRelays = () => {
  state.relays = DEFAULT_RELAYS;
};

export const removeRelay = (relay: string) => {
  state.relays = remove(state.relays, [relay]);
};

export const addRelay = (relay: string) => {
  state.relays = state.relays.concat([relay]);
};

export const setSearchResultProfile = (relay: string) => {
  state.relays = state.relays.concat([relay]);
};

export const getPicture = (pubkey: string) => {
  return state.profiles[pubkey]?.picture || getRoboHashUrl(pubkey);
};

// DEBUG
// @ts-ignore
window.state = state;
