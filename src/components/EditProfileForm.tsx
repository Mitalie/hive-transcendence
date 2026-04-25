"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import Button from "./Button";
import { updateProfileAction } from "@/actions/account";
import { checkUsernameAvailableAction } from "@/actions/registration";
import { useSession } from "next-auth/react";

interface EditProfileFormProps {
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
}

const BIO_MAX = 150;
const NAME_MAX = 20;

function useUsernameCheck(nameValue: string, originalName: string | null) {
  const [usernameAvailable, setUsernameAvailable] = useState<boolean>(true);
  const [checkingUsername, setCheckingUsername] = useState(false);

  useEffect(() => {
    const trimmed = nameValue.trim();
    const isUnchanged = trimmed === (originalName ?? "").trim();

    if (!trimmed || isUnchanged) {
      return;
    }

    let cancelled = false;

    const timeout = setTimeout(async () => {
      setCheckingUsername(true);
      const { available } = await checkUsernameAvailableAction(trimmed);
      if (!cancelled) {
        setUsernameAvailable(available);
        setCheckingUsername(false);
      }
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [nameValue, originalName]);

  return { usernameAvailable, checkingUsername };
}

export function EditProfileForm({
  displayName,
  bio,
  avatarUrl,
}: EditProfileFormProps) {
  const [nameValue, setNameValue] = useState(displayName ?? "");
  const [bioValue, setBioValue] = useState(() =>
    (bio ?? "").replace(/\r\n/g, "\n"),
  );
  const [avatarValue, setAvatarValue] = useState(avatarUrl ?? "");
  const [fileValue, setFileValue] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const { t } = useTranslation();
  const { update: updateSession } = useSession();

  const { usernameAvailable, checkingUsername } = useUsernameCheck(
    nameValue,
    displayName,
  );

  const bioTooLong = bioValue.length > BIO_MAX;
  const nameTooLong = nameValue.length > NAME_MAX;
  const nameChanged = nameValue.trim() !== (displayName ?? "").trim();

  const clearSelectedFile = () => {
    setFileValue(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (nameTooLong) {
      setError(t("settings.account.nameTooLong", { max: NAME_MAX }));
      return;
    }

    if (bioTooLong) {
      setError(t("settings.account.bioTooLong", { max: BIO_MAX }));
      return;
    }

    if (checkingUsername || (nameChanged && !usernameAvailable)) return;

    setLoading(true);
    setError("");
    setSuccess(false);

    const formData = new FormData();
    formData.append("displayName", nameValue);
    formData.append("bio", bioValue);
    formData.append("avatarUrl", avatarValue);

    if (fileValue) {
      formData.append("avatarFile", fileValue);
    }

    const result = await updateProfileAction(formData);

    if (!result.ok) {
      const key = result.error;
      if (key === "displayNameTaken") {
        setError(t("profile.usernameTaken"));
      } else {
        setError(t(`apiErrors.${key}`, t("profile.errorFallback")));
      }
    } else {
      setSuccess(true);
      clearSelectedFile();
      router.refresh();
      updateSession();
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-text/70">
            {t("settings.account.userName")}
          </label>
          <span
            className={`text-xs tabular-nums ${
              nameTooLong ? "text-red-500" : "text-text/40"
            }`}
          >
            {nameValue.length} / {NAME_MAX}
          </span>
        </div>
        <input
          type="text"
          value={nameValue}
          onChange={(e) => setNameValue(e.target.value)}
          className={`w-full px-4 py-2.5 rounded-lg text-sm text-text bg-button border placeholder:text-text/40 focus:outline-none focus:ring-2 transition-all ${
            nameTooLong
              ? "border-red-500/60 focus:ring-red-500/30"
              : "border-purple-light focus:ring-purple-light"
          }`}
        />
        {nameTooLong && (
          <p className="text-xs text-red-500">
            {t("settings.account.nameTooLong", { max: NAME_MAX })}
          </p>
        )}
        {!nameTooLong && nameChanged && nameValue.trim() && (
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

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-text/70">
            {t("settings.account.bio")}
          </label>
          <span
            className={`text-xs tabular-nums ${
              bioTooLong ? "text-red-500" : "text-text/40"
            }`}
          >
            {bioValue.length} / {BIO_MAX}
          </span>
        </div>
        <textarea
          value={bioValue}
          onChange={(e) => setBioValue(e.target.value.replace(/\r\n/g, "\n"))}
          rows={4}
          className={`w-full px-4 py-2.5 rounded-lg text-sm text-text bg-button border placeholder:text-text/40 focus:outline-none focus:ring-2 transition-all resize-none ${
            bioTooLong
              ? "border-red-500/60 focus:ring-red-500/30"
              : "border-purple-light focus:ring-purple-light"
          }`}
        />
        {bioTooLong && (
          <p className="text-xs text-red-500">
            {t("settings.account.bioTooLong", { max: BIO_MAX })}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-text/70">
          {t("settings.account.avatarUrl")}
        </label>
        <input
          type="text"
          value={avatarValue}
          onChange={(e) => {
            setAvatarValue(e.target.value);
            clearSelectedFile();
          }}
          className="w-full px-4 py-2.5 rounded-lg text-sm text-text bg-button border border-purple-light placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-purple-light transition-all"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-text/70">
          {t("settings.account.uploadAvatar")}
        </label>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-lg text-sm border border-purple-light bg-button text-text/70 hover:text-text transition-colors shrink-0"
          >
            {t("settings.account.chooseFile")}
          </button>
          <span className="text-sm text-text/50 truncate">
            {fileValue ? fileValue.name : t("settings.account.noFileChosen")}
          </span>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            setFileValue(file);
            if (file) {
              setAvatarValue("");
            }
          }}
        />
        <p className="text-xs text-text/50">
          {t("settings.account.uploadAvatarHint")}
        </p>
      </div>

      {error && (
        <p className="text-red-500 text-sm bg-red-500/10 rounded-lg py-2 px-3">
          {error}
        </p>
      )}

      {success && (
        <p className="text-green-600 text-sm bg-green-500/10 rounded-lg py-2 px-3 border border-green-500/20">
          {t("settings.account.updateSuccess")}
        </p>
      )}

      <Button
        type="submit"
        disabled={
          loading ||
          nameTooLong ||
          bioTooLong ||
          checkingUsername ||
          (nameChanged && !usernameAvailable)
        }
        className="mt-1 bg-gradient-to-r from-blue-dark to-purple-dark text-white text-base"
      >
        {loading
          ? t("settings.account.saving")
          : t("settings.account.saveChanges")}
      </Button>
    </form>
  );
}
