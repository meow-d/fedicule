import { createStore } from "solid-js/store";
import { makePersisted } from "@solid-primitives/storage";

// TODO
interface Auth {
  loggedIn: boolean;
  handle: string;
  instance?: string;
  token?: string;
  clientId?: string;
  clientSecret?: string;
  clientName: string;
  clientUrl: string;
}

export const [auth, setAuth] = makePersisted(
  createStore({
    handle: "",
    instance: "",
    loggedIn: false,
    token: "",
    clientId: "",
    clientSecret: "",
    clientName: "fedicule",
    clientUrl: window.location.href.split("?")[0],
  })
);
