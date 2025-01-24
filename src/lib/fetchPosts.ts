import { get, getNextPageUrl } from "./fetch";
import { PostsRaw, Account, Post, LikesOrBoost } from "../stores/data";

async function fetchPostData(numberOfPosts: number): Promise<PostsRaw> {
  let posts = await fetchPosts(numberOfPosts);
  if (!posts || posts.length === 0) {
    throw new Error("No posts on home timeline!");
  }

  posts = filterBoosts(posts);
  posts = filterUniquePosts(posts);

  let replies = await fetchReplies(posts);
  replies = filterUniquePosts(replies);
  posts = posts.concat(replies);

  const likes = await fetchLikes(posts);
  const boosts = await fetchBoosts(posts);

  return { posts, likes, boosts };
}

interface Params {
  limit: number;
  max_id?: string | null;
}

async function fetchPosts(numberOfPosts: number): Promise<Post[]> {
  const maxPosts = 40;
  let postsLeft = numberOfPosts;
  let posts: any[] = [];
  let params: Params = {
    limit: Math.min(postsLeft, maxPosts),
  };

  while (postsLeft > 0) {
    const response = await get("/api/v1/timelines/home", params);

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
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

async function fetchReplies(posts: Post[]): Promise<any[]> {
  // TODO: should probably standardize using map vs forEach vs for
  const replies: any = await Promise.all(
    posts.map(async (post) => {
      if (!post.in_reply_to_id && !post.replies_count) return [];
      const response = await get(`/api/v1/statuses/${post.id}/context`);
      if (!response.ok) return null;
      const data = await response.json();
      const ancestors = data.ancestors;
      const descendants = data.descendants;
      return { ancestors, descendants };
    })
  );

  return replies;
}

async function fetchLikes(posts: Post[]): Promise<LikesOrBoost[]> {
  return await fetchInteractions(posts, "favourited_by", "favourites_count");
}

async function fetchBoosts(posts: Post[]): Promise<LikesOrBoost[]> {
  return await fetchInteractions(posts, "reblogged_by", "reblogs_count");
}

async function fetchInteractions(
  posts: Post[],
  interactionType: string,
  countType: "favourites_count" | "reblogs_count"
): Promise<LikesOrBoost[]> {
  let interactions: any[] = [];

  for (const post of posts) {
    if (!post[countType]) continue;
    let url: string | null = `/api/v1/statuses/${post.id}/${interactionType}`;

    while (url) {
      const response = await get(url, { limit: 80 });
      const data: LikesOrBoost[] = await response.json();
      if (!response.ok) break;

      for (const interaction of data) {
        interaction.receiver = {
          label: post.account.acct,
          mastoApiId: post.account.id,
          display_name: post.account.display_name,
          image: post.account.avatar,
        };
      }
      interactions = interactions.concat(data);
      url = response.headers ? getNextPageUrl(response.headers.link) : null;
    }
  }
  return interactions;
}

async function fetchUser(userId: string): Promise<any> {
  const response = await get(`/api/v1/accounts/${userId}`, {});
  return await response.json();
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

export { fetchPostData, fetchUser };
