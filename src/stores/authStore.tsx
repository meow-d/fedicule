import { createStore } from "solid-js/store";
import { makePersisted } from "@solid-primitives/storage";

// TODO
export interface Auth {
  loggedIn: boolean;
  type?: "mastodon" | "bsky";

  // mastoapi
  handle?: string;
  instance?: string;
  token?: string;

  clientId?: string;
  clientSecret?: string;
  clientName: string;
  clientUrl: string;

  // bsky
  did?: string;
}

export const [auth, setAuth] = makePersisted(
  createStore<Auth>({
    loggedIn: false,

    clientName: "fedicule",
    clientUrl: window.location.href.split("?")[0],
  })
);
