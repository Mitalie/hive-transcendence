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
  invalid_current_password: "Current password is incorrect",
  passwords_mismatch: "Passwords do not match",
  password_too_short: "Password must be at least 6 characters",
  password_same_as_old: "New password has to be different than the current one",
} as const;

export type ApiErrorKey = keyof typeof apiErrors;
