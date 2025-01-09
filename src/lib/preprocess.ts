import { RawData, Node, ProcessedData } from "../stores/data";
import { fetchUser } from "./fetchData";

export default function preprocess(data: RawData): ProcessedData {
  const interactions: ProcessedData["interactions"] = [];

  function getMentionInfo(userId: any, callback: (node: Node) => void): Node {
    const node: Node = {
      label: userId.acct,
      mastoApiId: userId.id,
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

  const posts = [...data.posts, ...data.replies];
  const likes = data.likes;
  const boosts = data.boosts;

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
        receiver: getMentionInfo(mention.id, (node) =>
          console.log("updated node" + node)
        ),
        type: "mention",
      });
    });
  });

  likes.forEach((like) => {
    interactions.push({
      sender: {
        label: like.acct,
        mastoApiId: like.id,
        display_name: like.display_name,
        image: like.avatar,
      },
      receiver: like.receiver,
      type: "like",
    });
  });

  boosts.forEach((boost) => {
    interactions.push({
      sender: {
        label: boost.acct,
        mastoApiId: boost.id,
        display_name: boost.display_name,
        image: boost.avatar,
      },
      receiver: boost.receiver,
      type: "boost",
    });
  });

  return { interactions };
}
