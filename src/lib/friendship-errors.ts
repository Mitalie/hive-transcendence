export const friendshipErrors = {
  cannotAddSelf: "cannotAddSelf",
  userNotFound: "userNotFound",
  friendshipAlreadyExists: "friendshipAlreadyExists",
  friendRequestNotFound: "friendRequestNotFound",
  friendRequestAlreadyHandled: "friendRequestAlreadyHandled",
  notAllowed: "notAllowed",
  friendshipNotFound: "friendshipNotFound",
  notFriends: "notFriends",
  internalServerError: "internalServerError",
} as const;

export type FriendshipErrorKey = keyof typeof friendshipErrors;
