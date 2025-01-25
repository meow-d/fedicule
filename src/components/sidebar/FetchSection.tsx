import { createSignal, Show } from "solid-js";

import Button from "../ui/Button";
import Message from "../ui/Message";

import { auth } from "../../stores/authStore";
import { loading, setLoading } from "../../stores/loading";
import { data, FollowRaw, PostsRaw, setData } from "../../stores/data";

import { fetchPostData } from "../../lib/fetchPosts";
import preprocessPosts from "../../lib/preprocessPosts";
import { update } from "../graph/Graph";
import Section from "../ui/Section";
import Checkbox from "../ui/Checkbox";
import { fetchFollowData } from "../../lib/fetchFollows";
import preprocessFollows from "../../lib/preprocessFollows";

export default function FetchSection() {
  const [message, setMessage] = createSignal("");
  const [isError, setIsError] = createSignal(false);
  let homeCheckbox, followsCheckbox, fetchAmount;

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
    const postsRaw: PostsRaw = await fetchPostData(parseInt(numberOfPosts));
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

  return (
    <Section title="Fetch">
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
        <Button disabled={!auth.loggedIn || loading()} onClick={startFetch}>
          {data.postsRaw ? "refetch" : "fetch"}
        </Button>
        <Button
          onClick={async () => {
            // TODO: test code, remove
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
          reprocess data
        </Button>

        <Show when={message()}>
          <Message message={message()} isError={isError()} />
        </Show>
      </div>
    </Section>
  );
}
