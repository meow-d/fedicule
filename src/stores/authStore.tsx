import { createStore } from "solid-js/store";
import { makePersisted } from "@solid-primitives/storage";

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
