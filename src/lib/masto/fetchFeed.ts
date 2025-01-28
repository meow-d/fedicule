import { get, getNextPageUrl } from "./mastoApi";
import { MastoFeedRaw, MastoPost, MastoLikesOrBoost } from "../../stores/data";

export default async function fetchFeed(
  numberOfPosts: number
): Promise<MastoFeedRaw> {
  let posts;
  posts = await fetchPosts(numberOfPosts);
  posts = filterBoosts(posts);
  posts = filterUniquePosts(posts);

  if (!posts || posts.length === 0)
    throw new Error("No posts on home timeline!");

  const replies = await fetchReplies(posts);
  posts = posts.concat(replies);
  posts = filterUniquePosts(posts);

  const likes = await fetchLikes(posts);
  const boosts = await fetchBoosts(posts);

  return { posts, likes, boosts };
}

interface Params {
  limit: number;
  max_id?: string | null;
}

async function fetchPosts(numberOfPosts: number): Promise<MastoPost[]> {
  const maxPosts = 40;
  let postsLeft = numberOfPosts;
  let posts: any[] = [];
  let params: Params = {
    limit: Math.min(postsLeft, maxPosts),
  };

  while (postsLeft > 0) {
    const response = await get("/api/v1/timelines/home", params);
    const data = await response.json();
    posts = posts.concat(data);

    postsLeft -= maxPosts;
    params = {
      limit: Math.min(postsLeft, maxPosts),
      max_id: posts.length > 0 ? posts[posts.length - 1].id : null,
    };
  }

  return posts;
}

async function fetchReplies(posts: MastoPost[]): Promise<any[]> {
  return await Promise.all(
    posts.flatMap(async (post) => {
      if (!post.in_reply_to_id && !post.replies_count) return [];
      let response;
      try {
        response = await get(`/api/v1/statuses/${post.id}/context`);
      } catch (e) {
        console.error(e);
        return null;
      }
      const data = await response.json();
      const ancestors = data.ancestors;
      const descendants = data.descendants;
      return { ancestors, descendants };
    })
  );
}

async function fetchLikes(posts: MastoPost[]): Promise<MastoLikesOrBoost[]> {
  return await fetchInteractions(posts, "favourited_by", "favourites_count");
}

async function fetchBoosts(posts: MastoPost[]): Promise<MastoLikesOrBoost[]> {
  return await fetchInteractions(posts, "reblogged_by", "reblogs_count");
}

async function fetchInteractions(
  posts: MastoPost[],
  interactionType: string,
  countType: "favourites_count" | "reblogs_count"
): Promise<MastoLikesOrBoost[]> {
  let interactions: any[] = [];

  for (const post of posts) {
    if (!post[countType]) continue;
    let url: string | null = `/api/v1/statuses/${post.id}/${interactionType}`;

    while (url) {
      let response;
      try {
        response = await get(url, { limit: 80 });
      } catch (e) {
        console.error(e);
        break;
      }
      const data: MastoLikesOrBoost[] = await response.json();

      addReceiver(data, post);
      interactions = interactions.concat(data);

      url = getNextPageUrl(response.headers.link);
    }
  }
  return interactions;

  function addReceiver(data: MastoLikesOrBoost[], post: MastoPost) {
    data.forEach((interaction) => {
      interaction.receiver = {
        label: post.account.acct,
        mastoApiId: post.account.id,
        display_name: post.account.display_name,
        image: post.account.avatar,
      };
    });
  }
}

function filterUniquePosts(posts: any[]): any[] {
  return [
    ...new Map(
      posts.filter((post) => post).map((post) => [post.id, post])
    ).values(),
  ];
}

// unused due to the Amber Puppygirlhornypost problem™️
function boostToPosts(posts: any[]): any[] {
  return posts.map((post) => (post.reblog ? post.reblog : post));
}

function filterBoosts(posts: any[]): any[] {
  return posts.filter((post) => !post.reblog);
}
