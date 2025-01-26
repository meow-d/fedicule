import { createEffect, createSignal, onMount, Show } from "solid-js";

import { update } from "../graph/Graph";

import { fetchFeed as fetchFeedData } from "../../lib/mastoapi/fetchFeed";
import preprocessPosts from "../../lib/preprocessPosts";
import { fetchFollows as fetchFollowData } from "../../lib/mastoapi/fetchFollows";
import preprocessFollows from "../../lib/preprocessFollows";
import {
  createApp,
  getToken,
  redirectToInstance,
  revokeToken,
} from "../../lib/mastoapi/auth";

import Section from "../ui/Section";
import Checkbox from "../ui/Checkbox";
import Message from "../ui/Message";
import Button from "../ui/Button";

import { auth, setAuth } from "../../stores/authStore";
import { loading, setLoading } from "../../stores/loading";
import { data, FollowRaw, PostsRaw, setData } from "../../stores/data";

export default function DataSection() {
  const [message, setMessage] = createSignal("");
  const [isError, setIsError] = createSignal(false);
  const [fetchEnabled, setFetchEnabled] = createSignal(true);
  let homeCheckbox, followsCheckbox, fetchAmount, apiSelect;

  const login = async () => {
    try {
      const handle = (document.getElementById("handle") as HTMLInputElement)
        .value;
      const api = (apiSelect as unknown as HTMLSelectElement).value;

      if (!handle || !api) {
        throw new Error("Fields are not filled in");
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
      await createApp(instance);

      setAuth({ handle });
      setMessage("Redirecting to your instance...");
      await redirectToInstance();
    } catch (error: any) {
      console.error(error);
      setIsError(true);
      setMessage(error.message);
      setLoading(false);
    }
  };

  // TODO: error handling
  const startFetch = async () => {
    if (!homeCheckbox || !followsCheckbox || !fetchAmount) return;

    const isFollowsChecked = (followsCheckbox as HTMLInputElement).checked;
    const isHomeChecked = (homeCheckbox as HTMLInputElement).checked;

    if (!isFollowsChecked && !isHomeChecked) {
      setMessage("Please select at least one source");
      setIsError(true);
      return;
    }

    setData({ postsRaw: undefined, processedData: undefined });

    try {
      if (isFollowsChecked) await fetchFollows();
      if (isHomeChecked) await fetchPosts();
      setStatus("Success!", false, false);
      update();
    } catch (error: any) {
      console.error(error);
      setStatus(error.message, true, false);
    }
  };

  const fetchPosts = async () => {
    if (!fetchAmount) return;

    const numberOfPosts = (fetchAmount as HTMLInputElement).value;
    if (!numberOfPosts || isNaN(parseInt(numberOfPosts))) {
      throw new Error("Please enter a number");
    }

    setStatus("Fetching posts...");
    const postsRaw: PostsRaw = await fetchFeedData(parseInt(numberOfPosts));
    setData({ postsRaw });

    setStatus("Preprocessing posts and fetching extra data...");
    const processedData = preprocessPosts(postsRaw);
    if (data.processedData) {
      processedData.interaction = data.processedData.interaction.concat(
        processedData.interaction
      );
    }
    setData({ processedData });
  };

  const fetchFollows = async () => {
    setStatus("Fetching follows...");
    const followRaw = await fetchFollowData();
    setData({ followRaw });

    setStatus("Preprocessing follows...");
    const processedData = await preprocessFollows(followRaw);
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

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (!code) return;

    try {
      setLoading(false);
      setIsError(false);
      setMessage("Getting token from code...");
      getToken(code);
      window.history.replaceState(null, "hello safari user", "/");
      setMessage("");
    } catch (error: any) {
      console.error(error);
      setIsError(true);
      setMessage(error.message);
      setLoading(false);
    }
  });

  const logout = () => {
    try {
      setIsError(false);
      setLoading(true);
      setMessage("Logging out...");

      revokeToken();

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
          <Button disabled={loading()} onclick={login}>
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
          {data.postsRaw ? "refetch" : "fetch"}
        </Button>

        {/* TODO: remove test code */}
        <Button
          onClick={async () => {
            setData({ processedData: undefined });
            let processedData;
            if (data.followRaw) {
              processedData = await preprocessFollows(data.followRaw);
              setData({ processedData });
            }
            if (data.postsRaw) {
              const processedPosts = preprocessPosts(data.postsRaw);
              if (processedData) {
                processedData.interaction = processedData.interaction.concat(
                  processedPosts.interaction
                );
              }
              setData({ processedData });
            }
            setData({ processedData });
            console.log("processed data", processedData);
            update();
          }}
        >
          reprocess data (for testing purposes)
        </Button>

        <Show when={message()}>
          <Message message={message()} isError={isError()} />
        </Show>
      </div>
    </Section>
  );
}
