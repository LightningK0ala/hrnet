export interface NostrEvent {
  id: string;
  content: string;
  kind: number;
  pubkey: string;
  sig: string;
  // TODO: Type this
  tags: any;
  created_at: number;
}
