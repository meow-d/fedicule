import { createStore } from "solid-js/store";
import { makePersisted } from "@solid-primitives/storage";

export enum Filter {
  None,
  Followers,
  Following,
  Mutuals,
}

export interface Settings {
  filter: Filter;
  layout: "force" | "forceAtlas2";
  zoomAmount: number;
  search: string;
}

export const [settings, setSettings] = makePersisted(
  createStore<Settings>({
    filter: Filter.None,
    layout: "force",
    zoomAmount: 1.5,
    search: "",
  })
);
