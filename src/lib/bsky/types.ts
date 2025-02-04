import {
  AppBskyActorDefs,
  AppBskyFeedDefs,
  AppBskyFeedGetLikes,
  AppBskyFeedGetRepostedBy,
} from "@atcute/client/lexicons";

export interface BskyFeedRaw {
  threads: AppBskyFeedDefs.ThreadViewPost[];
  likes: {
    post: AppBskyFeedDefs.PostView;
    likes: AppBskyFeedGetLikes.Output;
  }[];
  reposts: {
    post: AppBskyFeedDefs.PostView;
    reposts: AppBskyFeedGetRepostedBy.Output;
  }[];
}

export interface BskyProfileWithFollowers extends AppBskyActorDefs.ProfileView {
  knownFollowers?: AppBskyActorDefs.ProfileView[];
}

export interface BskyFollowRaw {
  following: AppBskyActorDefs.ProfileView[];
  followers: AppBskyActorDefs.ProfileView[];
  familiarFollowers: BskyProfileWithFollowers[];
}
