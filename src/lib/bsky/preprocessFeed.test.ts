import { describe, it, expect } from "vitest";

import type { BskyFeedRaw } from "./types";
import type { ProcessedData } from "../../stores/data";
import preprocessFeed from "./preprocessFeed";

describe("preprocessFeed", () => {
  it("should process an empty feed", () => {
    const raw: BskyFeedRaw = {
      threads: [],
      likes: [],
      reposts: [],
    };

    const result = preprocessFeed(raw);
    const expected: ProcessedData = {
      interaction: [],
    };

    expect(result).toEqual(expected);
  });

  it("should process a feed with likes and boost", () => {
    const raw: BskyFeedRaw = {
      threads: [
        {
          post: {
            uri: "test-uri",
            author: {
              did: "did:1",
              handle: "alice",
              displayName: "Alice",
              avatar: "alice.jpg",
            },
            cid: "cid-1",
            indexedAt: "2024-02-04T00:00:00Z",
            record: {},
          },
        },
      ],
      likes: [
        {
          post: {
            author: {
              did: "did:1",
              handle: "alice",
              displayName: "Alice",
              avatar: "alice.jpg",
            },
            uri: "",
            cid: "",
            indexedAt: "2024-02-04T00:00:01Z",
            record: {},
          },
          likes: {
            likes: [
              {
                actor: {
                  did: "did:2",
                  handle: "bob",
                  displayName: "Bob",
                  avatar: "bob.jpg",
                },
                createdAt: "2024-02-05T06:42:21Z",
                indexedAt: "2024-02-04T00:00:01Z",
              },
            ],
            uri: "",
          },
        },
      ],
      reposts: [
        {
          post: {
            author: {
              did: "did:1",
              handle: "alice",
              displayName: "Alice",
              avatar: "alice.jpg",
            },
            uri: "post-uri",
            cid: "cid-3",
            indexedAt: "2024-02-04T00:00:02Z",
            record: {},
          },
          reposts: {
            repostedBy: [
              {
                did: "did:2",
                handle: "bob",
                displayName: "Bob",
                avatar: "bob.jpg",
              },
            ],
            uri: "",
          },
        },
      ],
    };

    const result = preprocessFeed(raw);
    expect(result.interaction).toHaveLength(2);
    expect(result.interaction.filter((i) => i.type === "like")).toHaveLength(1);
    expect(result.interaction.filter((i) => i.type === "boost")).toHaveLength(1);
    expect(result.interaction.filter((i) => i.type === "mention")).toHaveLength(0);
  });

  it("should process a feed with replies", () => {
    const postA = {
      uri: "test-uri",
      author: {
        did: "did:1" as `did:${string}`,
        handle: "alice",
        displayName: "Alice",
        avatar: "alice.jpg",
      },
      cid: "cid-1",
      indexedAt: "2024-02-04T00:00:00Z",
      record: {},
    };

    const postB = {
      uri: "reply-1",
      author: {
        did: "did:2" as `did:${string}`,
        handle: "bob",
        displayName: "Bob",
        avatar: "bob.jpg",
      },
      cid: "cid-2",
      indexedAt: "2024-02-04T00:00:01Z",
      record: {},
    };

    const postC = {
      uri: "reply-2",
      author: {
        did: "did:3" as `did:${string}`,
        handle: "charlie",
        displayName: "Charlie",
        avatar: "charlie.jpg",
      },
      cid: "cid-3",
      indexedAt: "2024-02-04T00:00:02Z",
      record: {},
    };

    const raw: BskyFeedRaw = {
      threads: [
        {
          post: postA,
          replies: [
            {
              post: postB,
              replies: [
                {
                  post: postC,
                  $type: "app.bsky.feed.defs#threadViewPost",
                },
              ],
              $type: "app.bsky.feed.defs#threadViewPost",
            },
          ],
        },
      ],
      likes: [],
      reposts: [],
    };

    const result = preprocessFeed(raw);
    expect(result.interaction).toHaveLength(2);
    expect(result.interaction.every((i) => i.type === "mention")).toBe(true);
    expect(result.interaction.find((i) => i.sender.label === "charlie")?.receiver.label).toBe("bob");
    expect(result.interaction.find((i) => i.sender.label === "bob")?.receiver.label).toBe("alice");
  });
});
