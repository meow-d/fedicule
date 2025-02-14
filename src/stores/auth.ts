import { createStore } from "solid-js/store";
import { makePersisted } from "@solid-primitives/storage";

type LoggedOut = {
  type: "";
};

type MastoAuth = {
  type: "mastoapi";
  loggedIn: boolean;
  handle: string;
  instance: string;
  clientId?: string;
  clientSecret?: string;
  token?: string;
};

type BskyAuth = {
  type: "bsky";
  loggedIn: boolean;
  handle: string;
  did: `did:${string}`;
};

export type Auth = LoggedOut | MastoAuth | BskyAuth;

export const [auth, setAuth] = makePersisted(
  createStore<Auth>({
    type: "",
  })
);
