import { createStore } from "solid-js/store";
import { makePersisted } from "@solid-primitives/storage";

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
  processedData?: ProcessedData;
}

export const [data, setData] = makePersisted(createStore<DataStore>());
