import { createStore } from "solid-js/store";
import { makePersisted } from "@solid-primitives/storage";
import { MultiDirectedGraph } from "graphology";

// MastoApi types
interface Account {
  id: string;
  acct: string;
  display_name: string;
  avatar: string;
}

interface FamiliarFollower {
  id: string;
  accounts: Account[];
}

interface Post {
  id: string;
  content: string;
  created_at: string;
  visibility: string;
  account: Account;
  favourites_count: number;
  reblogs_count: number;
  in_reply_to_id?: string;
  replies_count?: number;
  reblog?: Post;
}

// Follows
interface FollowRaw {
  following: Account[];
  followers: Account[];
  familiarFollowers: FamiliarFollower[];
}

// Posts
// TODO: is ths really the best name i can come up with?
interface LikesOrBoost extends Account {
  receiver?: Node;
}

interface PostsRaw {
  posts: Post[];
  likes: any[];
  boosts: any[];
}

// Processed
interface Node {
  label: string;
  mastoApiId: string;
  display_name: string;
  image: string;
}

interface Interaction {
  sender: Node;
  receiver: Node;
  type: "mention" | "boost" | "like" | "follow";
}

interface ProcessedData {
  interaction: Interaction[];
}

interface DataStore {
  postsRaw?: PostsRaw;
  processedData?: ProcessedData;
  followRaw?: FollowRaw;
  mastoAccount?: Account;
}

export const [data, setData] = makePersisted(createStore<DataStore>());

export type {
  Account,
  FamiliarFollower,
  Post,
  FollowRaw,
  LikesOrBoost,
  PostsRaw,
  Node,
  Interaction,
  ProcessedData,
};
