import { expect } from "vitest";
import { faker } from "@faker-js/faker";

import type { MastoAccount, MastoLikesOrBoost, MastoPost } from "./types";
import type { Interaction } from "../../stores/data";

export const createMockAccount = (): MastoAccount => ({
  id: faker.string.numeric(16),
  acct: "@" + faker.internet.username() + "@" + faker.internet.domainName(),
  display_name: faker.person.fullName(),
  avatar: faker.image.avatar(),
});

export const createMockPost = (account: MastoAccount, mentions?: MastoAccount[]): MastoPost => ({
  account,
  id: faker.string.numeric(16),
  content: faker.lorem.sentence(),
  created_at: faker.date.recent().toISOString(),
  visibility: "public",
  favourites_count: faker.number.int(100),
  reblogs_count: faker.number.int(100),
  mentions: mentions?.map((mention) => ({
    acct: mention.acct,
    id: mention.id,
  })),
});

export const createMockLikeOrBoost = (sender: MastoAccount, receiver: MastoAccount): MastoLikesOrBoost => ({
  ...sender,
  receiver: receiver,
});

/** Test interactions that contain the full data */
export const testInteraction = (
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

/** Test mention interactions, which do not contain receiver display name and image */
export const testMention = (interaction: Interaction, sender: MastoAccount, receiver: MastoAccount) => {
  expect(interaction.sender).toEqual({
    label: sender.acct,
    mastoApiId: sender.id,
    display_name: sender.display_name,
    image: sender.avatar,
  });
  expect(interaction.receiver).toEqual({
    label: receiver.acct,
    mastoApiId: receiver.id,
    display_name: "",
    image: "",
  });
  expect(interaction.type).toBe("mention");
};
