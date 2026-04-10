export const apiErrors = {
  missingFields: "missingFields",
  userNotFound: "userNotFound",
  displayNameTaken: "displayNameTaken",
  passwordTooShort: "passwordTooShort",
  userAlreadyExists: "userAlreadyExists",
  unauthorized: "unauthorized",
  displayNameTooLong: "displayNameTooLong",
  bioTooLong: "bioTooLong",
  avatarUrlTooLong: "avatarUrlTooLong",
} as const;

export type ApiErrorKey = keyof typeof apiErrors;
