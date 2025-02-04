import { createStore } from "solid-js/store";
import { makePersisted } from "@solid-primitives/storage";

enum UserFilter {
  None,
  FollowersOnly,
  MutualsOnly,
}

interface Settings {
  userFilter: UserFilter;
  layout: "force" | "forceAtlas2";
  zoomAmount: number;
  search: string;
}

const [settings, setSettings] = makePersisted(
  createStore<Settings>({
    userFilter: UserFilter.None,
    layout: "force",
    zoomAmount: 1.5,
    search: "",
  })
);

export { settings, setSettings, UserFilter };
