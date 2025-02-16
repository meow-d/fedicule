import { createEffect, createMemo, onMount, Show } from "solid-js";
import { createStore } from "solid-js/store";

import { update } from "../graph/Graph";

import Section from "../ui/Section";
import Checkbox from "../ui/Checkbox";
import Message from "../ui/Message";
import Button from "../ui/Button";

import { auth } from "../../stores/auth";
import { data, setData } from "../../stores/data";

import { Client } from "../../lib/Client";
import { MastoClient } from "../../lib/masto/client";
import { BskyClient } from "../../lib/bsky/client";
import { XRPCError } from "@atcute/client";

export default function DataSection() {
  // status
  const [status, setStatus] = createStore({ message: "", error: false, loading: false });

  // client
  let client: Client;
  const mastoClient = new MastoClient();
  const bskyClient = new BskyClient();

  const getClient = (api: "mastoapi" | "bsky") => {
    if (api === "mastoapi") {
      return mastoClient;
    } else if (api === "bsky") {
      return bskyClient;
    }
    throw new Error("Invalid API");
  };

  createEffect(() => {
    if (auth.type) {
      client = getClient(auth.type);
    } else {
      client = getClient(inputs.api);
    }
  });

  // fetch
  const startFetch = async () => {
    const handle = inputs.handle;
    const follows = inputs.follows;
    const home = inputs.home;
    const postsNo = inputs.postsNo;

    if (!handle) {
      throw new Error("Fields are not filled in");
    }
    if (!follows && !home) {
      setStatus({ message: "Please select at least one source", error: true, loading: false });
      return;
    }

    client.onProgress((update: string) => setStatus("message", update));
    setStatus({ error: false, loading: true });
    setData({ processedData: undefined });

    try {
      if (follows) await fetchFollows(client as Client);
      if (home) await fetchPosts(client as Client, postsNo);
      update();
    } catch (error: any) {
      let message = error.message;
      if (error instanceof XRPCError && error.kind === "invalid_token") {
        message = "Token expired. Please log in again.";
      }

      console.error(error);
      setStatus({
        message: message,
        error: true,
        loading: false,
      });
    }
  };

  const fetchFollows = async (client: Client) => {
    const processedData = await client.fetchFollows();
    setData({ processedData });
  };

  const fetchPosts = async (client: Client, postsNo: number) => {
    if (!postsNo) throw new Error("Please enter a number");

    const processedData = await client.fetchFeed(postsNo);
    if (data.processedData) {
      processedData.interaction = data.processedData.interaction.concat(processedData.interaction);
    }
    setData({ processedData });
  };

  // login
  const login = async () => {
    try {
      const handle = inputs.handle;
      const api = inputs.api;

      if (!handle || !api) {
        throw new Error("Fields are not filled in");
      }
      if (auth.type && auth.loggedIn) {
        throw new Error("Already logged in");
      }

      if (!client) throw new Error("Client not found...?");
      setStatus({ message: "Creatng auth url...", error: false, loading: true });
      const url = await client.createAuthUrl(handle);

      await new Promise((r) => setTimeout(r, 200));
      setStatus("message", "Redirecting you...");
      window.location.assign(url);
    } catch (error: any) {
      console.error(error);
    }
  };

  onMount(async () => {
    if (window.location.pathname === "/callback/mastoapi") {
      client = getClient("mastoapi");
    } else if (window.location.pathname === "/callback/bsky") {
      client = getClient("bsky");
    } else {
      return;
    }

    try {
      setStatus({
        message: "Logging you in...",
        error: false,
        loading: true,
      });
      if (!client) throw new Error("Not logged in?");
      await client.finalizeAuth(window.location);
      window.history.replaceState(null, "hello safari user", "/");
      setStatus({
        message: "Logged in :3",
        error: false,
        loading: false,
      });
    } catch (error: any) {
      console.error(error);
      setStatus({
        message: error.message,
        error: true,
        loading: false,
      });
    }
  });

  const logout = async () => {
    try {
      setStatus({ message: "Logging out...", error: false, loading: true });
      if (!client) throw new Error("urmmm client not found...  waht the fuck this isn't suppoed to hapen");
      await client.logout();
      setStatus({ message: "Logged out", error: false, loading: false });
    } catch (error: any) {
      console.error(error);
      setStatus({ message: error.message, error: true, loading: false });
    }
  };

  // UI
  interface Inputs {
    api: "mastoapi" | "bsky";
    handle: string;
    follows: boolean;
    home: boolean;
    postsNo: number;
  }
  const [inputs, setInputs] = createStore<Inputs>({
    follows: true,
    home: false,
    api: auth.type === "" ? "mastoapi" : auth.type,
    handle: auth.type === "" ? "" : auth.handle,
    postsNo: 100,
  });

  const fetchDisabled = createMemo(() => (!inputs.follows && !inputs.home) || status.loading);

  return (
    <Section title="Data" open={true}>
      {/* inputs */}
      <div>
        <label for="api">API</label>
        <select
          name="api"
          id="api"
          onChange={(e) => setInputs("api", e.target.value as "mastoapi" | "bsky")}
          disabled={status.loading || (!!auth.type && auth.loggedIn)}
        >
          <option value="mastoapi" selected={inputs.api === "mastoapi"}>
            Mastodon
          </option>
          <option value="bsky" selected={inputs.api === "bsky"}>
            Bluesky (wip)
          </option>
        </select>
      </div>

      <div>
        <label for="handle">Handle</label>
        <input
          type="text"
          name="handle"
          id="handle"
          value={inputs.handle}
          onChange={(e) => setInputs("handle", e.target.value)}
          disabled={status.loading || (!!auth.type && auth.loggedIn)}
        />
      </div>

      <div>
        <label>Sources</label>
        <span>
          <Checkbox
            name="follows"
            onChange={(e) => setInputs("follows", e.target.checked)}
            checked={inputs.follows}
            tooltip={"does not work with sharkey/akkoma's mastoapi"}
            showTooltip={auth.type === "mastoapi"}
          ></Checkbox>
        </span>
        <Checkbox name="home" displayName="home feed" onChange={(e) => setInputs("home", e.target.checked)}></Checkbox>
      </div>

      <Show when={inputs.home}>
        <div>
          <label for="fetch-amount">Home feed posts no.</label>
          <input
            type="number"
            name="fetch-amount"
            id="fetch-amount"
            value={inputs.postsNo}
            onChange={(e) => setInputs("postsNo", parseInt(e.target.value))}
            disabled={status.loading}
          />
        </div>
      </Show>

      {/* buttons */}
      <div>
        <Show
          when={auth.type && auth.loggedIn}
          fallback={
            <Button disabled={status.loading} onclick={login}>
              login
            </Button>
          }
        >
          <Button disabled={status.loading} onclick={logout}>
            logout
          </Button>

          <Button disabled={fetchDisabled()} onClick={startFetch}>
            {data.processedData ? "refetch" : "fetch"}
          </Button>
        </Show>

        <Show when={status.message}>
          <Message message={status.message} isError={status.error} />
        </Show>
      </div>
    </Section>
  );
}
