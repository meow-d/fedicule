import { createStore } from "solid-js/store";
import { makePersisted } from "@solid-primitives/storage";

// TODO
interface Auth {
  loggedIn: boolean;
  type?: "mastodon" | "bsky";
  handle?: string;
  instance?: string;
  token?: string;

  clientId?: string;
  clientSecret?: string;
  clientName: string;
  clientUrl: string;
}

export const [auth, setAuth] = makePersisted(
  createStore<Auth>({
    loggedIn: false,

    clientName: "fedicule",
    clientUrl: window.location.href.split("?")[0],
  })
);
