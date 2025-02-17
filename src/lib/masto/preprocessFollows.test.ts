import { describe, it, expect } from "vitest";
import { faker } from "@faker-js/faker";

import type { MastoFollowRaw, MastoAccount, MastoFamiliarFollower } from "./types";
import type { Interaction } from "../../stores/data";
import preprocessFollows from "./preprocessFollows";

describe("preprocessFollows", () => {
  const createMockAccount = (): MastoAccount => ({
    id: faker.string.numeric(16),
    acct: faker.internet.email(),
    display_name: faker.person.fullName(),
    avatar: faker.image.avatar(),
  });

  const account = createMockAccount();
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
    user: account,
  };

  const testInteraction = (
    interaction: Interaction,
    sender: MastoAccount,
    receiver: MastoAccount,
    type: Interaction["type"]
  ) => {
    expect(interaction.sender).toEqual({
      label: sender.acct,
      mastoApiId: sender.id,
      display_name: sender.display_name,
      image: sender.avatar,
    });
    expect(interaction.receiver).toEqual({
      label: receiver.acct,
      mastoApiId: receiver.id,
      display_name: receiver.display_name,
      image: receiver.avatar,
    });
    expect(interaction.type).toBe(type);
  };

  it("should process following, followers, and familiar followers correctly", async () => {
    const result = await preprocessFollows(mockFollowRaw);

    expect(result.interaction).toHaveLength(4);

    testInteraction(result.interaction[0], account, accountA, "follow");
    testInteraction(result.interaction[1], account, accountB, "follow");
    testInteraction(result.interaction[2], accountC, account, "follow");
    testInteraction(result.interaction[3], accountB, accountA, "follow");
  });
});
