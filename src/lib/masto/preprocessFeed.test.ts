import { describe, it, expect } from "vitest";

import type { MastoFeedRaw } from "./types";
import { createMockAccount, createMockLikeOrBoost, createMockPost, testInteraction, testMention } from "./testUtils";
import preprocessFeed from "./preprocessFeed";

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
    const accountA = createMockAccount();
    const accountB = createMockAccount();
    const accountC = createMockAccount();

    const testFeed: MastoFeedRaw = {
      posts: [
        createMockPost(accountA, [accountB]),
        createMockPost(accountB, [accountA]),
        createMockPost(accountC, [accountB, accountA]),
        createMockPost(accountC),
      ],
      likes: [
        createMockLikeOrBoost(accountA, accountB),
        createMockLikeOrBoost(accountB, accountA),
        createMockLikeOrBoost(accountC, accountA),
      ],
      boosts: [createMockLikeOrBoost(accountC, accountB)],
    };

    const result = preprocessFeed(testFeed);

    expect(result.interaction).toHaveLength(8);
    testMention(result.interaction[0], accountA, accountB);
    testMention(result.interaction[1], accountB, accountA);
    testMention(result.interaction[2], accountC, accountB);
    testMention(result.interaction[3], accountC, accountA);
    testInteraction(result.interaction[4], accountA, accountB, "like");
    testInteraction(result.interaction[5], accountB, accountA, "like");
    testInteraction(result.interaction[6], accountC, accountA, "like");
    testInteraction(result.interaction[7], accountC, accountB, "boost");
  });
});
