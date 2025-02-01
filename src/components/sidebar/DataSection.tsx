import { createEffect, createMemo, createSignal, onMount, Show } from "solid-js";
import { createStore } from "solid-js/store";

import { update } from "../graph/Graph";

import { MastoClient } from "../../lib/masto/client";

import { createApp, getToken, redirectToInstance, revokeToken } from "../../lib/masto/auth";

import Section from "../ui/Section";
import Checkbox from "../ui/Checkbox";
import Message from "../ui/Message";
import Button from "../ui/Button";

import { auth, setAuth } from "../../stores/authStore";
import { data, setData } from "../../stores/data";
import { Client } from "../../lib/Client";
import { BskyClient } from "../../lib/bsky/client";

export default function DataSection() {
  // status
  const [status, setStatus] = createStore({ message: "", error: false, loading: false });

  // fetch
  const startFetch = async () => {
    const api = inputs.api;
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

    setData({ processedData: undefined });

    let client;
    if (api === "mastoapi") {
      client = new MastoClient();
    } else if (api === "bsky") {
      client = await BskyClient.create(handle);
    } else {
      throw new Error("Not implemented");
    }

    setStatus("loading", true);
    client.onProgress((update) => setStatus("message", update));

    try {
      if (follows) await fetchFollows(client as Client);
      if (home) await fetchPosts(client as Client, postsNo);
      update();
    } catch (error: any) {
      console.error(error);
      setStatus({
        message: error.message,
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
  const mastoLogin = async () => {
    try {
      const handle = inputs.handle;
      const api = inputs.api;

      if (!handle || !api) {
        throw new Error("Fields are not filled in");
      }
      if (api === "bsky") {
        throw new Error("No login required for Bluesky");
      }
      if (auth.loggedIn) {
        throw new Error("Already logged in");
      }

      const instance = handle.split("@")[2];
      if (!instance) {
        throw new Error("Invalid handle");
      }

      setAuth(await createApp(instance, auth));

      setAuth({ handle });
      redirectToInstance(auth);
    } catch (error: any) {
      console.error(error);
    }
  };

  onMount(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (!code) return;

    try {
      setStatus({
        message: "Getting token from code...",
        error: false,
        loading: true,
      });
      window.history.replaceState(null, "hello safari user", "/");
      setAuth(await getToken(code, auth));
      setStatus({
        message: "Logged in..",
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
      // TODO: should be tied to client
      setAuth(await revokeToken(auth));
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
    api: "mastoapi",
    handle: auth.handle ?? "",
    postsNo: 100,
  });

  const postsNoVisible = createMemo(() => inputs.home);
  const loginVisible = createMemo(() => inputs.api === "mastoapi" && !auth.loggedIn);
  const fetchEnabled = createMemo(() => inputs.follows || inputs.home);
  const fetchVisible = createMemo(() => inputs.api !== "mastoapi" || !!auth.loggedIn);

  return (
    <Section title="Data" open={!data.processedData}>
      {/* inputs */}
      <div>
        <label for="api">API</label>
        <select
          name="api"
          id="api"
          onChange={(e) => setInputs("api", e.target.value as "mastoapi" | "bsky")}
          disabled={status.loading || auth.loggedIn}
        >
          <option value="mastoapi" selected>
            Mastodon
          </option>
          <option value="bsky">Bluesky</option>
          {/* TODO */}
          {/* <option value="misskey">Misskey</option> */}
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
          disabled={status.loading || auth.loggedIn}
        />
      </div>

      <div>
        <label>Sources</label>
        <Checkbox
          name="follows"
          onChange={(e) => setInputs("follows", e.target.checked)}
          checked={inputs.follows}
        ></Checkbox>
        <Checkbox name="home" displayName="home feed" onChange={(e) => setInputs("home", e.target.checked)}></Checkbox>
      </div>

      <Show when={postsNoVisible}>
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
          when={auth.loggedIn}
          fallback={
            <Show when={loginVisible()}>
              <Button disabled={status.loading} onclick={mastoLogin}>
                login
              </Button>
            </Show>
          }
        >
          <Button disabled={status.loading} onclick={logout}>
            logout
          </Button>
        </Show>

        <Show when={fetchVisible()}>
          <Button disabled={!fetchEnabled() || status.loading} onClick={startFetch}>
            {data.mastoFeedRaw ? "refetch" : "fetch"}
          </Button>
        </Show>

        <Show when={status.message}>
          <Message message={status.message} isError={status.error} />
        </Show>
      </div>
    </Section>
  );
}
