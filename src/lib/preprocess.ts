import { RawData, Node, ProcessedData } from "../stores/data";
import { fetchUser } from "./fetchData";

export default function preprocess(data: RawData): ProcessedData {
  const interactions: ProcessedData["interaction"] = [];

  preprocessMentions(data.posts, interactions);
  preprocessInteractions(data.likes, "like", interactions);
  preprocessInteractions(data.boosts, "boost", interactions);

  return { interaction: interactions };
}

function preprocessMentions(posts: any[], interactions: any[]) {
  posts.forEach((post) => {
    if (post.mentions === undefined || post.mentions.length == 0) {
      return;
    }

    post.mentions.forEach((mention: { [x: string]: any }) => {
      interactions.push({
        sender: {
          label: post.account.acct,
          mastoApiId: post.account.id,
          display_name: post.account.display_name,
          image: post.account.avatar,
        },
        receiver: getMentionInfo(mention, (node) =>
          console.log("updated node" + node)
        ),
        type: "mention",
      });
    });
  });
}

function preprocessInteractions(
  raw: any[],
  interactionType: string,
  interactions: any[]
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

  // const user = fetchUser(userId.id).then((user) => {
  //   node.display_name = user.display_name;
  //   node.image = user.avatar;
  //   callback(node);
  // });

  return node;
}
