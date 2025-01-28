import { rpc } from "./rpc";
import {
  AppBskyFeedDefs,
  AppBskyFeedGetLikes,
  AppBskyFeedGetRepostedBy,
} from "@atcute/client/lexicons";

interface BskyFeedRaw {
  posts: AppBskyFeedDefs.FeedViewPost[];
  threads: AppBskyFeedDefs.ThreadViewPost[];
  likes: AppBskyFeedGetLikes.Output[];
  boosts: AppBskyFeedGetRepostedBy.Output[];
}

export default async function fetchFeed(
  numberOfPosts: number
): Promise<BskyFeedRaw> {
  let posts = await fetchPosts(numberOfPosts);
  posts = filterBoosts(posts);
  posts = filterUnique(posts);

  if (!posts || posts.length === 0)
    throw new Error("No posts on home timeline!");

  let threads = (await fetchThreads(posts)) as AppBskyFeedDefs.ThreadViewPost[];
  threads = filterUnique(threads);

  const likes = await fetchLikes(posts);
  const boosts = await fetchReposts(posts);

  return { posts, threads, likes, boosts };
}

async function fetchPosts(numberOfPosts: number) {
  const data = await rpc.get("app.bsky.feed.getTimeline", {
    params: { limit: numberOfPosts },
  });
  return data.data.feed;
}

async function fetchThreads(posts: AppBskyFeedDefs.FeedViewPost[]) {
  return await Promise.all(
    posts.flatMap(async (post) => {
      if (!post.post.replyCount) return [];

      const data = await rpc.get("app.bsky.feed.getPostThread", {
        params: { uri: post.post.uri, depth: 1000, parentHeight: 1000 },
      });

      if (data.data.thread.$type != "app.bsky.feed.defs#threadViewPost")
        return [];
      return data.data.thread;
    })
  );
}

async function fetchLikes(posts: AppBskyFeedDefs.FeedViewPost[]) {
  const interactions = [];
  for (const post of posts) {
    if (!post.post.likeCount) continue;
    const data = await rpc.get("app.bsky.feed.getLikes", {
      params: { uri: post.post.uri },
    });
    interactions.push(data.data);
  }
  return interactions;
}

async function fetchReposts(posts: AppBskyFeedDefs.FeedViewPost[]) {
  const interactions = [];
  for (const post of posts) {
    if (!post.post.repostCount) continue;
    const data = await rpc.get("app.bsky.feed.getRepostedBy", {
      params: { uri: post.post.uri },
    });
    interactions.push(data.data);
  }
  return interactions;
}

function filterUnique(items: any): any {
  return [...new Set(items)];
}

function filterBoosts(posts: AppBskyFeedDefs.FeedViewPost[]) {
  return posts.filter((post) => !post.reason);
}
