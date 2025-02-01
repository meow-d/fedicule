import { rpc } from "./rpc";
import {
  AppBskyFeedDefs,
  AppBskyFeedGetLikes,
  AppBskyFeedGetRepostedBy,
} from "@atcute/client/lexicons";

export interface BskyFeedRaw {
  threads: AppBskyFeedDefs.ThreadViewPost[];
  likes: {
    post: AppBskyFeedDefs.PostView;
    likes: AppBskyFeedGetLikes.Output;
  }[];
  reposts: {
    post: AppBskyFeedDefs.PostView;
    reposts: AppBskyFeedGetRepostedBy.Output;
  }[];
}

export default async function fetchFeed(numberOfPosts: number): Promise<BskyFeedRaw> {
  const postRoots = await fetchTimelineRoot(numberOfPosts);

  if (!postRoots || postRoots.length === 0) {
    throw new Error("No posts on home timeline!");
  }

  const threads = (await fetchThreads(postRoots)) as AppBskyFeedDefs.ThreadViewPost[];

  const likes = await fetchLikes(postRoots);
  const reposts = await fetchReposts(postRoots);

  return { threads, likes, reposts };
}

async function fetchTimelineRoot(numberOfPosts: number) {
  const data = await rpc.get("app.bsky.feed.getTimeline", {
    params: { limit: numberOfPosts },
  });

  const feed = filterBoosts(data.data.feed);
  let postRoots = mapRoots(feed);
  postRoots = filterUnique(postRoots);
  return postRoots;

  function filterBoosts(feed: AppBskyFeedDefs.FeedViewPost[]) {
    return feed.filter((post) => !post.reason);
  }

  function mapRoots(feed: AppBskyFeedDefs.FeedViewPost[]): AppBskyFeedDefs.PostView[] {
    return feed.flatMap((post) => {
      if (!post.reply?.root) return [];
      if (post.reply.root.$type !== "app.bsky.feed.defs#postView") return [];
      return [post.reply.root as AppBskyFeedDefs.PostView];
    });
  }

  function filterUnique(items: any): any {
    return [...new Set(items)];
  }
}

async function fetchThreads(posts: AppBskyFeedDefs.PostView[]) {
  const threads = await Promise.all(
    posts.map(async (post) => {
      if (!post.replyCount) return;

      const data = await rpc.get("app.bsky.feed.getPostThread", {
        params: { uri: post.uri, depth: 1000, parentHeight: 1000 },
      });

      if (data.data.thread.$type !== "app.bsky.feed.defs#threadViewPost") return;
      return data.data.thread;
    })
  );

  return threads.filter(Boolean);
}

async function fetchLikes(posts: AppBskyFeedDefs.PostView[]) {
  const interactions: BskyFeedRaw["likes"] = [];
  for (const post of posts) {
    if (!post.likeCount) continue;
    const data = await rpc.get("app.bsky.feed.getLikes", {
      params: { uri: post.uri },
    });
    interactions.push({
      post,
      likes: data.data,
    });
  }
  return interactions;
}

async function fetchReposts(posts: AppBskyFeedDefs.PostView[]) {
  const interactions: BskyFeedRaw["reposts"] = [];
  for (const post of posts) {
    if (!post.repostCount) continue;
    const data = await rpc.get("app.bsky.feed.getRepostedBy", {
      params: { uri: post.uri },
    });
    interactions.push({
      post,
      reposts: data.data,
    });
  }
  return interactions;
}
