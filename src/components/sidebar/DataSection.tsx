import { createSignal, Show } from "solid-js";

import Button from "./Button";
import Message from "./Message";

import { auth } from "../../stores/authStore";
import { loading, setLoading } from "../../stores/loading";
import { data, RawData, setData } from "../../stores/data";

import { fetchData } from "../../lib/fetchData";
import preprocess from "../../lib/preprocess";
import { update } from "../Graph";
import Section from "./Section";

export default function DataSection() {
  const [message, setMessage] = createSignal("");
  const [isError, setIsError] = createSignal(false);

  const startFetch = async () => {
    try {
      const numberOfPosts = (
        document.getElementById("fetch-amount") as HTMLInputElement
      ).value;
      if (!numberOfPosts || isNaN(parseInt(numberOfPosts))) {
        throw new Error("Please enter a number");
      }

      setIsError(false);
      setMessage("Fetching posts...");
      setLoading(true);

      const rawData: RawData = await fetchData(parseInt(numberOfPosts));
      setData({ rawData: rawData });

      setMessage("Preprocessing posts and fetching extra data...");
      const processedData = preprocess(rawData);
      setData({ processedData: processedData });

      setMessage("Success!");
      setLoading(false);
      update();
    } catch (error: any) {
      console.error(error);
      setIsError(true);
      setMessage(error.message);
      setLoading(false);
    }
  };

  return (
    <Section title="Fetch">
      <div>
        <label for="fetch-amount">Posts to fetch</label>
        <input
          type="number"
          name="fetch-amount"
          id="fetch-amount"
          value="100"
          disabled={loading()}
        />
      </div>

      <div>
        <Button disabled={!auth.loggedIn || loading()} onClick={startFetch}>
          {data.rawData ? "refetch posts" : "fetch posts"}
        </Button>
        <Button
          onClick={() => {
            if (!data.rawData) return;
            const processedData = preprocess(data.rawData);
            setData({ processedData: processedData });
            console.log("processed data", processedData);
            update();
          }}
        >
          reprocess data
        </Button>

        <Show when={message()}>
          <Message message={message()} isError={isError()} />
        </Show>
      </div>
    </Section>
  );
}
