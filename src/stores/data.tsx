import { createStore } from "solid-js/store";
import { makePersisted } from "@solid-primitives/storage";
import { MultiDirectedGraph } from "graphology";

interface Account {
  id: string;
  acct: string;
  display_name: string;
  avatar: string;
}

interface Interaction extends Account {
  receiver?: Node;
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

interface RawData {
  posts: Post[];
  likes: any[];
  boosts: any[];
}

interface Node {
  label: string;
  mastoApiId: string;
  display_name: string;
  image: string;
}

interface ProcessedData {
  interaction: {
    sender: Node;
    receiver: Node;
    type: "mention" | "boost" | "like";
  }[];
}

interface DataStore {
  rawData?: RawData;
  processedData?: ProcessedData;
  graph?: MultiDirectedGraph;
}

export const [data, setData] = makePersisted(
  createStore<DataStore>({
    rawData: undefined,
    processedData: undefined,
    graph: undefined,
  })
);

export type { Account, Interaction, Post, RawData, Node, ProcessedData };
