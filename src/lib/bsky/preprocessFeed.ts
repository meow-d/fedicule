import { AppBskyActorDefs, AppBskyFeedDefs } from "@atcute/client/lexicons";
import { ProcessedData, Interaction, Node } from "../../stores/data";
import { BskyFeedRaw } from "./fetchFeed";

export default function preprocessFeed(raw: BskyFeedRaw): ProcessedData {
  const interactions: Interaction[] = [];
  preprocessThreads(raw.threads, interactions);
  preprocessLikes(raw.likes, interactions);
  preprocessReposts(raw.reposts, interactions);
  return { interaction: interactions };
}

function preprocessThreads(threads: AppBskyFeedDefs.ThreadViewPost[], interactions: Interaction[]) {
  const visited = new Set<string>();
  threads.forEach((thread) => {
    processPost(thread);
  });

  function processPost(post: AppBskyFeedDefs.ThreadViewPost) {
    if (visited.has(post.post.uri)) return;
    visited.add(post.post.uri);

    // it shouldn't have any parents but just in case
    if (post.parent) {
      if (post.parent.$type === "app.bsky.feed.defs#threadViewPost") {
        interactions.push(createMention(post.post.author, post.parent.post.author));
        processPost(post.parent);
      }
    }

    if (post.replies) {
      post.replies.forEach((reply) => {
        if (reply.$type === "app.bsky.feed.defs#threadViewPost") {
          interactions.push(createMention(post.post.author, reply.post.author));
          processPost(reply);
        }
      });
    }
  }

  function createMention(
    sender: AppBskyActorDefs.ProfileViewBasic,
    receiver: AppBskyActorDefs.ProfileViewBasic
  ): Interaction {
    return {
      sender: createNode(sender as AppBskyActorDefs.ProfileView),
      receiver: createNode(receiver as AppBskyActorDefs.ProfileView),
      type: "mention",
    };
  }
}

function preprocessLikes(raw: BskyFeedRaw["likes"], interactions: Interaction[]) {
  raw.forEach((post) => {
    post.likes.likes?.forEach((interaction) => {
      interactions.push({
        sender: createNode(interaction.actor),
        receiver: createNode(post.post.author as AppBskyActorDefs.ProfileView),
        type: "like",
      });
    });
  });
}

function preprocessReposts(raw: BskyFeedRaw["reposts"], interactions: Interaction[]) {
  raw.forEach((post) => {
    post.reposts.repostedBy?.forEach((interaction) => {
      interactions.push({
        sender: createNode(interaction),
        receiver: createNode(post.post.author as AppBskyActorDefs.ProfileView),
        type: "like",
      });
    });
  });
}

function createNode(author: AppBskyActorDefs.ProfileView): Node {
  return {
    label: author.handle,
    bskyDid: author.did,
    display_name: author.displayName || author.handle,
    image: author.avatar || "",
  };
}
