import { AppBskyActorDefs } from "@atcute/client/lexicons";

import { ProcessedData } from "../../stores/data";

import { Client } from "../Client";

import fetchFeed from "./fetchFeed";
import fetchFollows from "./fetchFollows";
import preprocessFollows from "./preprocessFollows";
import fetchCurrentUser from "./fetchCurrentUser";
import preprocessFeed from "./preprocessFeed";
import { createAuthUrl, finalizeAuth, logout } from "./auth";

export class BskyClient extends Client {
  // auth
  createAuthUrl(handle: string): Promise<string | URL> {
    return createAuthUrl(handle);
  }

  finalizeAuth(url: Location): Promise<void> {
    return finalizeAuth(url);
  }

  logout(): Promise<void> {
    return logout();
  }

  // data
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
    const user = await fetchCurrentUser();

    this.emitProgress("Processing follows...");
    const processed = preprocessFollows(raw, user as AppBskyActorDefs.ProfileView);

    this.emitProgress("Success!");
    return processed;
  }
}
