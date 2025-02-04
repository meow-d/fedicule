import { createStore } from "solid-js/store";
import { makePersisted } from "@solid-primitives/storage";

type LoggedOut = {
  loggedIn: false;
};

type MastoAuth = {
  // TODO: loggedIn is misleading...
  loggedIn: true;
  type: "mastoapi";
  handle: string;
  instance: string;
  clientId: string;
  clientSecret: string;
  token?: string;
};

type BskyAuth = {
  loggedIn: true;
  type: "bsky";
  did: `did:${string}`;
};

export type Auth = LoggedOut | MastoAuth | BskyAuth;

export const [auth, setAuth] = makePersisted(
  createStore<Auth>({
    loggedIn: false,
  })
);
