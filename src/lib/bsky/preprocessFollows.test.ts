import { describe, it, expect } from "vitest";
import preprocessFollows from "./preprocessFollows";
import type { BskyFollowRaw } from "./types";
import type { AppBskyActorDefs } from "@atcute/client/lexicons";

describe("preprocessFollows", () => {
  const mockUser: AppBskyActorDefs.ProfileView = {
    did: "did:plc:user123",
    handle: "user123",
    displayName: "Test User",
    avatar: "avatar.jpg",
  };

  const mockFollowing: AppBskyActorDefs.ProfileView = {
    did: "did:plc:following123",
    handle: "following123",
    displayName: "Following User",
    avatar: "following.jpg",
  };

  const mockFollower: AppBskyActorDefs.ProfileView = {
    did: "did:plc:follower123",
    handle: "follower123",
    displayName: "Follower User",
    avatar: "follower.jpg",
  };

  const mockRaw: BskyFollowRaw = {
    following: [mockFollowing],
    followers: [mockFollower],
    familiarFollowers: [],
  };

  it("should process following and followers into interactions", async () => {
    const result = await preprocessFollows(mockRaw, mockUser);

    expect(result.interaction).toHaveLength(2);
    expect(result.interaction).toContainEqual({
      sender: {
        label: mockUser.handle,
        bskyDid: mockUser.did,
        display_name: mockUser.displayName,
        image: mockUser.avatar,
      },
      receiver: {
        label: mockFollowing.handle,
        bskyDid: mockFollowing.did,
        display_name: mockFollowing.displayName,
        image: mockFollowing.avatar,
      },
      type: "follow",
    });
    expect(result.interaction).toContainEqual({
      sender: {
        label: mockFollower.handle,
        bskyDid: mockFollower.did,
        display_name: mockFollower.displayName,
        image: mockFollower.avatar,
      },
      receiver: {
        label: mockUser.handle,
        bskyDid: mockUser.did,
        display_name: mockUser.displayName,
        image: mockUser.avatar,
      },
      type: "follow",
    });
  });

  it("should handle empty following and followers", async () => {
    const raw: BskyFollowRaw = {
      following: [],
      followers: [],
      familiarFollowers: [],
    };

    const result = await preprocessFollows(raw, mockUser);

    expect(result.interaction).toHaveLength(0);
  });
});
