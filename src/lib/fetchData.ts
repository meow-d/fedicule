import { get } from "./sendRequest";
import { RawData } from "../stores/data";

async function fetchData(numberOfPosts: number): Promise<RawData> {
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

async function fetchPosts(numberOfPosts: number) {
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

async function fetchReplies(posts: any[]) {
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

async function fetchLikes(posts: any[]) {
  return await fetchInteractions(posts, "favourited_by", "favourites_count");
}

async function fetchBoosts(posts: any[]) {
  return await fetchInteractions(posts, "reblogged_by", "reblogs_count");
}

async function fetchInteractions(
  posts: any[],
  interactionType: string,
  countType: string
): Promise<any[]> {
  let interactions: any[] = [];

  for (const post of posts) {
    if (!post[countType]) continue;
    let url: string | null = `/api/v1/statuses/${post.id}/${interactionType}`;

    while (url) {
      const response = await get(url, { limit: 80 });
      const data = await response.json();
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

function getNextPageUrl(linkHeader: string | null): string | null {
  if (!linkHeader) return null;

  const links = linkHeader.split(",").map((link) => link.trim());

  for (const link of links) {
    const [urlPart, relPart] = link.split(";").map((part) => part.trim());
    if (relPart === 'rel="next"') {
      return urlPart.slice(1, -1);
    }
  }

  return null;
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

export { fetchData, fetchUser };
