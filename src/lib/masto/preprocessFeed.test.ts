import { describe, it, expect } from "vitest";
import preprocessFeed from "./preprocessFeed";
import type { MastoFeedRaw } from "./types";

describe("preprocessFeed", () => {
  it("should process an empty feed", () => {
    const emptyFeed: MastoFeedRaw = {
      posts: [],
      likes: [],
      boosts: [],
    };

    const result = preprocessFeed(emptyFeed);
    expect(result.interaction).toEqual([]);
  });

  it("should process mentions, likes and boosts", () => {
    const testFeed: MastoFeedRaw = {
      posts: [
        {
          account: {
            acct: "sender1",
            id: "1",
            display_name: "Sender One",
            avatar: "avatar1.jpg",
          },
          mentions: [
            {
              acct: "receiver1",
              id: "2",
            },
          ],
          id: "1",
          content:
            'Hello #mastodon hashtag mastodon im guy "reply guy" reply, a reply guy, here to reply on your #guys. my pronoun? he/him. i love joe biden',
          created_at: "this is supposed to be a date but it doesn't matter",
          visibility: "public",
          favourites_count: 1,
          reblogs_count: 1,
        },
      ],
      likes: [
        {
          acct: "liker1",
          id: "3",
          display_name: "Liker One",
          avatar: "avatar2.jpg",
          receiver: {
            label: "receiver2",
            mastoApiId: "4",
            display_name: "Receiver Two",
            image: "avatar3.jpg",
          },
        },
      ],
      boosts: [
        {
          acct: "booster1",
          id: "5",
          display_name: "Booster One",
          avatar: "avatar4.jpg",
          receiver: {
            label: "receiver3",
            mastoApiId: "6",
            display_name: "Receiver Three",
            image: "avatar5.jpg",
          },
        },
      ],
    };

    const result = preprocessFeed(testFeed);

    expect(result.interaction).toHaveLength(3);
    expect(result.interaction[0].type).toBe("mention");
    expect(result.interaction[1].type).toBe("like");
    expect(result.interaction[2].type).toBe("boost");
  });
});
