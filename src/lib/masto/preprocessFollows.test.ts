import { describe, it, expect, beforeEach } from "vitest";
import preprocessFollows from "./preprocessFollows";
import { data } from "../../stores/data";
import type { MastoFollowRaw, MastoAccount } from "./types";

// TODO: (or to not do) check everything
// copilot generated...
describe("preprocessFollows", () => {
  const mockAccount: MastoAccount = {
    id: "1",
    acct: "replyguy@mastodon.social",
    display_name: "Test User",
    avatar: "avatar.jpg",
  };

  const mockFollowRaw: MastoFollowRaw = {
    following: [
      {
        id: "following1",
        display_name: "Following 1",
        avatar: "following1.jpg",
        acct: "replyguy2@mastodon.social",
      },
      {
        id: "familiar1",
        display_name: "Familiar 1",
        avatar: "familiar1.jpg",
        acct: "replyguy2@mastodon.social",
      },
    ],
    followers: [
      {
        id: "follower1",
        display_name: "Follower 1",
        avatar: "follower1.jpg",
        acct: "replyguy2@mastodon.social",
      },
    ],
    familiarFollowers: [
      {
        id: "following1",
        accounts: [
          {
            id: "familiar1",
            display_name: "Familiar 1",
            avatar: "familiar1.jpg",
            acct: "replyguy2@mastodon.social",
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    data.mastoAccount = mockAccount;
  });

  it("should throw error if mastoAccount not found", async () => {
    data.mastoAccount = undefined;
    await expect(preprocessFollows(mockFollowRaw)).rejects.toThrow("User mastodon account not found");
  });

  it("should process following and followers correctly", async () => {
    const result = await preprocessFollows(mockFollowRaw);

    expect(result.interaction).toHaveLength(3);
    expect(result.interaction[0]).toEqual({
      sender: {
        label: mockAccount.display_name,
        mastoApiId: mockAccount.id,
        display_name: mockAccount.display_name,
        image: mockAccount.avatar,
      },
      receiver: {
        label: mockFollowRaw.following[0].display_name,
        mastoApiId: mockFollowRaw.following[0].id,
        display_name: mockFollowRaw.following[0].display_name,
        image: mockFollowRaw.following[0].avatar,
      },
      type: "follow",
    });
  });

  it("should process familiar followers correctly", async () => {
    const result = await preprocessFollows(mockFollowRaw);

    const familiarInteraction = result.interaction.find(
      (i) => i.sender.mastoApiId === "familiar1" && i.receiver.mastoApiId === "following1"
    );

    expect(familiarInteraction).toBeTruthy();
    expect(familiarInteraction?.type).toBe("follow");
  });
});
