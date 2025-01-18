import { createStore } from "solid-js/store";
import { makePersisted } from "@solid-primitives/storage";
import { MultiDirectedGraph } from "graphology";

interface RawData {
  posts: any[];
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

export type { RawData, Node, ProcessedData };
