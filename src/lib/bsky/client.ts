import { AppBskyActorDefs } from "@atcute/client/lexicons";
import { ProcessedData } from "../../stores/data";
import { Client } from "../Client";

import fetchFeed from "./fetchFeed";
// import preprocessFeed from "./preprocessFeed";
import fetchFollows from "./fetchFollows";
import preprocessFollows from "./preprocessFollows";
import { fetchCurrentUser, resolveHandle } from "./user";

export class BskyClient extends Client {
  did: string;

  private constructor(did: string) {
    super();
    this.did = did;
  }

  static async create(handle: string): Promise<BskyClient> {
    const did = await resolveHandle(handle);
    return new BskyClient(did);
  }

  // TODO
  async fetchFeed(numberOfPosts: number): Promise<ProcessedData> {
    throw new Error("Not implemented");
    this.emitProgress("Fetching feed...");
    const raw = await fetchFeed(numberOfPosts);

    this.emitProgress("Processing feed...");
    // const processed = preprocessFeed(raw);

    this.emitProgress("Success!");
    return { interaction: [] };
    // return processed;
  }

  async fetchFollows(): Promise<ProcessedData> {
    this.emitProgress("Fetching follows...");
    const raw = await fetchFollows(this.did);

    // TODO: we're kinda fetching data we already has
    const user = await fetchCurrentUser(this.did);

    this.emitProgress("Processing follows...");
    const processed = preprocessFollows(
      raw,
      user as AppBskyActorDefs.ProfileView
    );

    this.emitProgress("Success!");
    return processed;
  }
}
