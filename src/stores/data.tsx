import { createStore } from "solid-js/store";
import { makePersisted } from "@solid-primitives/storage";
import { AppBskyActorDefs } from "@atcute/client/lexicons";

// MastoApi types
// TODO: ok i have no idea what to name these, should probably put into its own file
export interface MastoAccount {
  id: string;
  acct: string;
  display_name: string;
  avatar: string;
}

export interface MastoFamiliarFollower {
  id: string;
  accounts: MastoAccount[];
}

export interface MastoPost {
  id: string;
  content: string;
  created_at: string;
  visibility: string;
  account: MastoAccount;
  favourites_count: number;
  reblogs_count: number;
  in_reply_to_id?: string;
  replies_count?: number;
  reblog?: MastoPost;
}

// TODO: is ths really the best name i can come up with?
export interface MastoLikesOrBoost extends MastoAccount {
  receiver?: Node;
}

export interface MastoFeedRaw {
  posts: MastoPost[];
  likes: any[];
  boosts: any[];
}

export interface MastoFollowRaw {
  following: MastoAccount[];
  followers: MastoAccount[];
  familiarFollowers: MastoFamiliarFollower[];
}

// Bsky types
export interface BskyPostsRaw {}

export interface BskyProfileWithFollowers extends AppBskyActorDefs.ProfileView {
  knownFollowers?: AppBskyActorDefs.ProfileView[];
}

export interface BskyFollowRaw {
  following: AppBskyActorDefs.ProfileView[];
  followers: AppBskyActorDefs.ProfileView[];
  familiarFollowers: BskyProfileWithFollowers[];
}

// Processed
export interface Node {
  label: string;
  mastoApiId?: string;
  bskyDid?: string;
  display_name: string;
  image: string;
}

export interface Interaction {
  sender: Node;
  receiver: Node;
  type: "mention" | "boost" | "like" | "follow";
}

export interface ProcessedData {
  interaction: Interaction[];
}

export interface DataStore {
  mastoAccount?: MastoAccount;
  mastoFeedRaw?: MastoFeedRaw;
  mastoFollowRaw?: MastoFollowRaw;
  bskyAccount?: AppBskyActorDefs.ProfileView;
  // TODO bskyPostsRaw?: any;
  bskyFollowRaw?: BskyFollowRaw;
  processedData?: ProcessedData;
}

export const [data, setData] = makePersisted(createStore<DataStore>());
