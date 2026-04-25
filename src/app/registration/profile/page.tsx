"use client";

import { useRef, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Button from "@/components/Button";
import { useTranslation } from "react-i18next";
import {
  completeRegistrationProfileAction,
  checkUsernameAvailableAction,
} from "@/actions/registration";

type AvatarChoice = "default" | "github" | "upload";

export default function ProfileSetupPage() {
  const [displayName, setDisplayName] = useState("");
  const [avatarChoice, setAvatarChoice] = useState<AvatarChoice>("default");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null,
  );
  const [checkingUsername, setCheckingUsername] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { t } = useTranslation();
  const { update: updateSession } = useSession();

  const showGithubOption = false; // FIXME: session?.user?.image no longer exists

  const handleAvatarChoice = (choice: AvatarChoice) => {
    setAvatarChoice(choice);
    setError("");

    if (choice !== "upload") {
      setAvatarFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (!displayName.trim()) {
      setUsernameAvailable(null);
      return;
    }
    setCheckingUsername(true);
    const timeout = setTimeout(async () => {
      const { available } = await checkUsernameAvailableAction(
        displayName.trim(),
      );
      setUsernameAvailable(available);
      setCheckingUsername(false);
    }, 500);
    return () => clearTimeout(timeout);
  }, [displayName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameAvailable) return;
    setError("");
    setLoading(true);

    try {
      const trimmedDisplayName = displayName.trim();

      if (!trimmedDisplayName) {
        throw new Error(
          t("apiErrors.missingFields", t("profile.errorFallback")),
        );
      }

      if (avatarChoice === "upload" && !avatarFile) {
        throw new Error(
          t("profile.reselectUpload", "Please select your image."),
        );
      }

      const formData = new FormData();
      formData.append("displayName", trimmedDisplayName);
      formData.append("avatarChoice", avatarChoice);

      if (avatarChoice === "upload" && avatarFile) {
        formData.append("avatarFile", avatarFile);
      }

      const result = await completeRegistrationProfileAction(formData);

      if (!result.ok) {
        throw new Error(
          t(`apiErrors.${result.error}`, t("profile.errorFallback")),
        );
      }

      updateSession();
      window.location.href = "/";
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("Unique constraint")) {
        setError(t("profile.usernameTaken"));
      } else {
        setError(
          err instanceof Error ? err.message : t("profile.errorUnexpected"),
        );
      }
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 h-full flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-sm sm:max-w-md bg-card rounded-2xl p-6 sm:p-10 flex flex-col gap-5 shadow-xl">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-text">
            {t("profile.title")}
          </h1>
          <p className="text-sm text-text/50 mt-1">{t("profile.subtitle")}</p>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center bg-red-500/10 rounded-lg py-2 px-3">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text/70">
              {t("profile.userNameLabel")}
            </label>
            <input
              type="text"
              placeholder={t("profile.userNamePlaceholder")}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg text-sm text-text bg-button border border-purple-light placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-purple-light transition-all"
              required
            />
            {displayName.trim() && (
              <p
                className={`text-xs mt-0.5 ${
                  checkingUsername
                    ? "text-text/40"
                    : usernameAvailable
                      ? "text-green-500"
                      : "text-red-500"
                }`}
              >
                {checkingUsername
                  ? t("profile.usernameChecking")
                  : usernameAvailable
                    ? t("profile.usernameAvailable")
                    : t("profile.usernameTaken")}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-text/70">
              {t("profile.avatarLabel", "Avatar")}
            </p>

            <label className="flex items-center gap-2 text-sm text-text">
              <input
                type="radio"
                name="avatarChoice"
                value="default"
                checked={avatarChoice === "default"}
                onChange={() => handleAvatarChoice("default")}
              />
              {t("profile.avatarDefault", "Use default avatar")}
            </label>

            {showGithubOption && (
              <label className="flex items-center gap-2 text-sm text-text">
                <input
                  type="radio"
                  name="avatarChoice"
                  value="github"
                  checked={avatarChoice === "github"}
                  onChange={() => handleAvatarChoice("github")}
                />
                {t("profile.avatarGithub", "Use my GitHub avatar")}
              </label>
            )}

            <label className="flex items-center gap-2 text-sm text-text">
              <input
                type="radio"
                name="avatarChoice"
                value="upload"
                checked={avatarChoice === "upload"}
                onChange={() => handleAvatarChoice("upload")}
              />
              {t("profile.avatarUpload", "Upload an image")}
            </label>

            {avatarChoice === "upload" && (
              <div className="flex flex-col gap-1 pl-5">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-lg text-sm border border-purple-light bg-button text-text/70 hover:text-text transition-colors shrink-0"
                  >
                    {t("settings.account.chooseFile")}
                  </button>
                  <span className="text-sm text-text/50 truncate">
                    {avatarFile
                      ? avatarFile.name
                      : t("settings.account.noFileChosen")}
                  </span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    const maxSize = 5 * 1024 * 1024; // 5 MB

                    if (file.size > maxSize) {
                      setError("Image is too large. Maximum size is 5 MB.");
                      e.target.value = "";
                      return;
                    }

                    setError("");
                    setAvatarFile(file);
                  }}
                />
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading || !usernameAvailable || checkingUsername}
            className="bg-gradient-to-r from-blue-dark to-purple-dark mt-1 text-white text-xl"
          >
            {loading ? t("profile.loading") : t("profile.submit")}
          </Button>
        </form>
      </div>
    </div>
  );
}
