import { createEffect, createSignal, onMount, Show } from "solid-js";

import { update } from "../graph/Graph";

import { MastoClient } from "../../lib/masto/client";

import {
  createApp,
  getToken,
  redirectToInstance,
  revokeToken,
} from "../../lib/masto/auth";

import Section from "../ui/Section";
import Checkbox from "../ui/Checkbox";
import Message from "../ui/Message";
import Button from "../ui/Button";

import { auth, setAuth } from "../../stores/authStore";
import { loading, setLoading } from "../../stores/loading";
import { data, MastoFollowRaw, MastoFeedRaw, setData } from "../../stores/data";
import { Client } from "../../lib/Client";
import { BskyClient } from "../../lib/bsky/client";

export default function DataSection() {
  const [message, setMessage] = createSignal("");
  const [isError, setIsError] = createSignal(false);
  const [fetchEnabled, setFetchEnabled] = createSignal(true);
  let homeCheckbox, followsCheckbox, fetchAmount, apiSelect, handleInput;

  const mastoLogin = async () => {
    try {
      const handle = (handleInput as unknown as HTMLInputElement).value;
      const api = (apiSelect as unknown as HTMLSelectElement).value;

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

      setLoading(true);
      setIsError(false);
      setMessage("Creating app...");
      setAuth(await createApp(instance, auth));

      setAuth({ handle });
      setMessage("Redirecting to your instance...");
      redirectToInstance(auth);
    } catch (error: any) {
      console.error(error);
      setIsError(true);
      setMessage(error.message);
      setLoading(false);
    }
  };

  const startFetch = async () => {
    if (!homeCheckbox || !followsCheckbox || !fetchAmount || !apiSelect) return;

    const isFollowsChecked = (followsCheckbox as HTMLInputElement).checked;
    const isHomeChecked = (homeCheckbox as HTMLInputElement).checked;
    const api = (apiSelect as unknown as HTMLSelectElement).value;
    const handle = (handleInput as unknown as HTMLInputElement).value;
    if (!handle) {
      throw new Error("Fields are not filled in");
    }
    if (!isFollowsChecked && !isHomeChecked) {
      setMessage("Please select at least one source");
      setIsError(true);
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

    client.onProgress((update) => setMessage(update));

    try {
      if (isFollowsChecked) await fetchFollows(client as Client);
      if (isHomeChecked) await fetchPosts(client as Client);
      update();
    } catch (error: any) {
      console.error(error);
      setStatus(error.message, true, false);
    }
  };

  const fetchFollows = async (client: Client) => {
    const processedData = await client.fetchFollows();
    setData({ processedData });
  };

  const fetchPosts = async (client: Client) => {
    if (!fetchAmount) return;

    const postCount = (fetchAmount as HTMLInputElement).value;
    const postCountInt = parseInt(postCount);
    if (!postCount || isNaN(postCountInt)) {
      throw new Error("Please enter a number");
    }

    const processedData = await client.fetchFeed(postCountInt);
    if (data.processedData) {
      processedData.interaction = data.processedData.interaction.concat(
        processedData.interaction
      );
    }
    setData({ processedData });
  };

  const setStatus = (
    newMessage: string,
    error?: boolean,
    loading?: boolean
  ) => {
    setIsError(error || false);
    setMessage(newMessage);
    setLoading(loading || true);
  };

  onMount(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (!code) return;

    try {
      setLoading(false);
      setIsError(false);
      setMessage("Getting token from code...");
      window.history.replaceState(null, "hello safari user", "/");
      setAuth(await getToken(code, auth));
      setMessage("");
    } catch (error: any) {
      console.error(error);
      setIsError(true);
      setMessage(error.message);
      setLoading(false);
    }
  });

  const logout = async () => {
    try {
      setIsError(false);
      setLoading(true);
      setMessage("Logging out...");

      setAuth(await revokeToken(auth));

      setLoading(false);
      setMessage("");
    } catch (error: any) {
      console.error(error);
      setIsError(true);
      setMessage(error.message);
      setLoading(false);
    }
  };

  const updateFetchEnabled = () => {
    setFetchEnabled(
      (apiSelect as unknown as HTMLSelectElement).value === "mastoapi" &&
        (homeCheckbox as unknown as HTMLInputElement).checked
    );
  };
  onMount(updateFetchEnabled);

  return (
    <Section title="Data" open={!data.processedData}>
      <div>
        <label for="api">API</label>
        <select
          name="api"
          id="api"
          disabled={loading() || auth.loggedIn}
          ref={apiSelect}
          onChange={updateFetchEnabled}
        >
          <option value="mastoapi">Mastodon</option>
          {/* TODO */}
          {/* <option value="bsky">Bluesky</option> */}
          {/* <option value="misskey">Misskey</option> */}
        </select>
      </div>

      <div>
        <label for="handle">Handle</label>
        <input
          type="text"
          name="handle"
          id="handle"
          value={auth.handle ? auth.handle : ""}
          ref={handleInput}
          disabled={loading() || auth.loggedIn}
        />
      </div>

      <div>
        <label>Sources</label>
        <Checkbox
          name="follows"
          ref={followsCheckbox}
          checked={true}
        ></Checkbox>
        <Checkbox
          name="home"
          displayName="home feed"
          ref={homeCheckbox}
          onChange={updateFetchEnabled}
        ></Checkbox>
      </div>

      <div>
        <label for="fetch-amount">Home feed posts no.</label>
        <input
          type="number"
          name="fetch-amount"
          id="fetch-amount"
          value="100"
          ref={fetchAmount}
          disabled={loading()}
        />
      </div>

      <div>
        <Show when={!auth.loggedIn}>
          <Button disabled={loading()} onclick={mastoLogin}>
            login
          </Button>
        </Show>

        <Show when={auth.loggedIn}>
          <Button disabled={loading()} onclick={logout}>
            logout
          </Button>
        </Show>

        <Button
          disabled={(fetchEnabled() && !auth.loggedIn) || loading()}
          onClick={startFetch}
        >
          {data.mastoFeedRaw ? "refetch" : "fetch"}
        </Button>

        <Show when={message()}>
          <Message message={message()} isError={isError()} />
        </Show>
      </div>
    </Section>
  );
}
