import { Interaction, Node, ProcessedData } from "../../stores/data";
import { MastoFeedRaw, MastoLikesOrBoost, mastoMentions as MastoMentions, MastoPost } from "./types";
import { fetchUser } from "./user";

export default function preprocessFeed(data: MastoFeedRaw): ProcessedData {
  const interactions: Interaction[] = [];

  preprocessMentions(data.posts, interactions);
  preprocessLikesOrBoost(data.likes, "like", interactions);
  preprocessLikesOrBoost(data.boosts, "boost", interactions);

  return { interaction: interactions };
}

function preprocessMentions(posts: MastoPost[], interactions: Interaction[]) {
  posts.forEach((post) => {
    if (!post.mentions) return;

    post.mentions.forEach((mention) => {
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

  function getMentionInfo(mention: MastoMentions, callback: (node: Node) => void): Node {
    const node: Node = {
      label: mention.acct,
      mastoApiId: mention.id,
      display_name: "",
      image: "",
    };

    // TODO: only fetch for missing info... but we need the graph to be processed first to know... fuck..
    // const user = fetchUser(userId.id).then((user) => {
    //   node.display_name = user.display_name;
    //   node.image = user.avatar;
    //   callback(node);
    // });

    return node;
  }
}

function preprocessLikesOrBoost(
  raw: MastoLikesOrBoost[],
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
      receiver: {
        label: interaction.receiver.acct,
        mastoApiId: interaction.receiver.id,
        display_name: interaction.receiver.display_name,
        image: interaction.receiver.avatar,
      },
      type: interactionType,
    });
  });
}
