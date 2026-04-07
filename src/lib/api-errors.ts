export const apiErrors = {
  missingFields: "missingFields",
  userNotFound: "userNotFound",
  displayNameTaken: "displayNameTaken",
  passwordTooShort: "passwordTooShort",
  userAlreadyExists: "userAlreadyExists",
  unauthorized: "unauthorized",
} as const;

export type ApiErrorKey = keyof typeof apiErrors;
