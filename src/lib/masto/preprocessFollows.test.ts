import { describe, it, expect } from "vitest";

import type { MastoFollowRaw, MastoFamiliarFollower } from "./types";
import { createMockAccount, testInteraction } from "./testUtils";
import preprocessFollows from "./preprocessFollows";

describe("preprocessFollows", () => {
  it("should process following, followers, and familiar followers correctly", async () => {
    const user = createMockAccount();
    const accountA = createMockAccount();
    const accountB = createMockAccount();
    const accountC = createMockAccount();

    const mockFamiliarFollowers: MastoFamiliarFollower[] = [
      {
        id: accountA.id,
        accounts: [accountB],
      },
    ];

    const mockFollowRaw: MastoFollowRaw = {
      following: [accountA, accountB],
      followers: [accountC],
      familiarFollowers: mockFamiliarFollowers,
      user: user,
    };

    const result = await preprocessFollows(mockFollowRaw);

    expect(result.interaction).toHaveLength(4);

    testInteraction(result.interaction[0], user, accountA, "follow");
    testInteraction(result.interaction[1], user, accountB, "follow");
    testInteraction(result.interaction[2], accountC, user, "follow");
    testInteraction(result.interaction[3], accountB, accountA, "follow");
  });
});
