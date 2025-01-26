import { Interaction, PostsRaw, Node, ProcessedData } from "../../stores/data";
import { fetchUser } from "./fetchFeed";

export default function preprocessPosts(data: PostsRaw): ProcessedData {
  const interactions: Interaction[] = [];

  preprocessMentions(data.posts, interactions);
  preprocessLikesOrBoost(data.likes, "like", interactions);
  preprocessLikesOrBoost(data.boosts, "boost", interactions);

  return { interaction: interactions };
}

function preprocessMentions(posts: any[], interactions: Interaction[]) {
  posts.forEach((post) => {
    if (!post.mentions) return;

    post.mentions.forEach((mention: { [x: string]: any }) => {
      interactions.push({
        sender: {
          label: post.account.acct,
          mastoApiId: post.account.id,
          display_name: post.account.display_name,
          image: post.account.avatar,
        },
        receiver: getMentionInfo(mention, () => {}),
        type: "mention",
      });
    });
  });
}

function preprocessLikesOrBoost(
  raw: any[],
  interactionType: "boost" | "like",
  interactions: Interaction[]
) {
  raw.forEach((interaction) => {
    interactions.push({
      sender: {
        label: interaction.acct,
        mastoApiId: interaction.id,
        display_name: interaction.display_name,
        image: interaction.avatar,
      },
      receiver: interaction.receiver,
      type: interactionType,
    });
  });
}

function getMentionInfo(mention: any, callback: (node: Node) => void): Node {
  const node: Node = {
    label: mention.acct,
    mastoApiId: mention.id,
    display_name: "",
    image: "",
  };

  // TODO: enable eventually
  // const user = fetchUser(userId.id).then((user) => {
  //   node.display_name = user.display_name;
  //   node.image = user.avatar;
  //   callback(node);
  // });

  return node;
}
