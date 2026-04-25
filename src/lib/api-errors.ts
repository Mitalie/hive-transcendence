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
  internalServerError: "internalServerError",
  invalidImageUrl: "invalidImageUrl",
  fileTooLarge: "fileTooLarge",
  errorUnexpected: "errorUnexpected",
  emailTooLong: "emailTooLong",
} as const;

export type ApiErrorKey = keyof typeof apiErrors;
