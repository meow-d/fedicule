import { describe, it, expect } from "vitest";

import type { BskyFollowRaw, BskyProfileWithFollowers } from "./types";
import type { AppBskyActorDefs } from "@atcute/client/lexicons";
import preprocessFollows from "./preprocessFollows";

describe("preprocessFollows", () => {
  const createMockUser = (
    did: `did:${string}`,
    handle: string,
    displayName: string,
    avatar: string
  ): AppBskyActorDefs.ProfileView => ({
    did,
    handle,
    displayName,
    avatar,
  });

  const createFamiliarFollow = (
    user: AppBskyActorDefs.ProfileView,
    followers: AppBskyActorDefs.ProfileView[]
  ): BskyProfileWithFollowers => ({
    ...user,
    knownFollowers: followers,
  });

  const createExpectedInteraction = (sender: AppBskyActorDefs.ProfileView, receiver: AppBskyActorDefs.ProfileView) => ({
    sender: {
      label: sender.handle,
      bskyDid: sender.did,
      display_name: sender.displayName,
      image: sender.avatar,
    },
    receiver: {
      label: receiver.handle,
      bskyDid: receiver.did,
      display_name: receiver.displayName,
      image: receiver.avatar,
    },
    type: "follow",
  });

  it("should process following and followers into interactions", async () => {
    const mockUser = createMockUser("did:plc:user123", "user123", "Test User", "avatar.jpg");
    const mockUserA = createMockUser("did:plc:following123", "following123", "Following User", "following.jpg");
    const mockUserB = createMockUser("did:plc:follower123", "follower123", "Follower User", "follower.jpg");
    const mockUserAFamiliar = createFamiliarFollow(mockUserA, [mockUserB]);
    const mockUserBFamiliar = createFamiliarFollow(mockUserB, [mockUserA]);
    const raw: BskyFollowRaw = {
      following: [mockUserA],
      followers: [mockUserB],
      familiarFollowers: [mockUserAFamiliar, mockUserBFamiliar],
    };

    const result = await preprocessFollows(raw, mockUser);

    expect(result.interaction).toHaveLength(4);
    expect(result.interaction).toContainEqual(createExpectedInteraction(mockUser, mockUserA));
    expect(result.interaction).toContainEqual(createExpectedInteraction(mockUserB, mockUser));
    expect(result.interaction).toContainEqual(createExpectedInteraction(mockUserA, mockUserB));
    expect(result.interaction).toContainEqual(createExpectedInteraction(mockUserB, mockUserA));
  });

  it("should handle empty following and followers", async () => {
    const mockUser = createMockUser("did:plc:user123", "user123", "Test User", "avatar.jpg");
    const raw: BskyFollowRaw = {
      following: [],
      followers: [],
      familiarFollowers: [],
    };

    const result = await preprocessFollows(raw, mockUser);

    expect(result.interaction).toHaveLength(0);
  });
});
