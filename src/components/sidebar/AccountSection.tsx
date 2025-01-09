import { createSignal, onMount, Show } from "solid-js";

import Message from "./Message";
import Button from "./Button";
import {
  createApp,
  getToken,
  redirectToInstance,
  revokeToken,
} from "../../lib/auth";
import { auth, setAuth } from "../../stores/authStore";
import { loading, setLoading } from "../../stores/loading";
import Section from "./Section";

export default function AccountSection() {
  const [message, setMessage] = createSignal("");
  const [isError, setIsError] = createSignal(false);

  const login = async () => {
    try {
      const handle = (document.getElementById("handle") as HTMLInputElement)
        .value;
      const api = (document.getElementById("api") as HTMLSelectElement).value;

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

      setMessage("Redirecting to your instance...");
      await redirectToInstance();
    } catch (error: any) {
      console.error(error);
      setIsError(true);
      setMessage(error.message);
      setLoading(false);
    }
  };

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

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code) {
      setLoading(false);
      setIsError(false);
      setMessage("Getting token from code...");
      getToken(code);
      window.history.replaceState(null, "hello safari user", "/");
      setMessage("");
    }
  });

  return (
    <Section title="Account" open={true}>
      <div>
        <label for="handle">Handle </label>
        <input
          type="text"
          name="handle"
          id="handle"
          value={auth.handle}
          disabled={loading() || auth.loggedIn}
        />
      </div>

      <div>
        <label for="api">API</label>
        <select name="api" id="api" disabled={loading() || auth.loggedIn}>
          <option value="mastoapi">Mastodon</option>
          {/* <option value="misskey">Misskey</option> */}
        </select>
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

        <Show when={message()}>
          <Message message={message()} isError={isError()} />
        </Show>
      </div>
    </Section>
  );
}
