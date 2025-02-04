import { Node } from "../../stores/data";

export interface MastoAccount {
  id: string;
  acct: string;
  display_name: string;
  avatar: string;
}
export interface MastoFamiliarFollower {
  id: string;
  accounts: MastoAccount[];
}

export interface mastoMentions {
  acct: string;
  id: string;
}

export interface MastoPost {
  id: string;
  content: string;
  created_at: string;
  mentions?: mastoMentions[];
  visibility: string;
  account: MastoAccount;
  favourites_count: number;
  reblogs_count: number;
  in_reply_to_id?: string;
  replies_count?: number;
  reblog?: MastoPost;
}

export interface MastoLikesOrBoost extends MastoAccount {
  receiver?: Node;
}

export interface MastoFeedRaw {
  posts: MastoPost[];
  likes: any[];
  boosts: any[];
}

export interface MastoFollowRaw {
  following: MastoAccount[];
  followers: MastoAccount[];
  familiarFollowers: MastoFamiliarFollower[];
}
