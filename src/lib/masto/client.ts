import { ProcessedData } from "../../stores/data";
import { Client } from "../Client";

import fetchFeed from "./fetchFeed";
import preprocessFeed from "./preprocessFeed";
import fetchFollows from "./fetchFollows";
import preprocessFollows from "./preprocessFollows";

// TODO use callback for status messages
export class MastoClient extends Client {
  async fetchFeed(numberOfPosts: number): Promise<ProcessedData> {
    this.emitProgress("Fetching feed...");
    const raw = await fetchFeed(numberOfPosts);
    this.emitProgress("Processing feed...");
    const processed = preprocessFeed(raw);
    this.emitProgress("Success!");
    return processed;
  }

  async fetchFollows(): Promise<ProcessedData> {
    this.emitProgress("Fetching follows...");
    const raw = await fetchFollows();
    this.emitProgress("Processing follows...");
    const processed = preprocessFollows(raw);
    this.emitProgress("Success!");
    return processed;
  }
}
