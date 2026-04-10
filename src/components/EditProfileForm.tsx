"use client";

import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "./Button";
import { updateProfileAction } from "@/actions/account";

interface EditProfileFormProps {
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
}

export function EditProfileForm({
  displayName,
  bio,
  avatarUrl,
}: EditProfileFormProps) {
  const [nameValue, setNameValue] = useState(displayName ?? "");
  const [bioValue, setBioValue] = useState(bio ?? "");
  const [avatarValue, setAvatarValue] = useState(avatarUrl ?? "");
  const [fileValue, setFileValue] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { t } = useTranslation();

  const clearSelectedFile = () => {
    setFileValue(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setError(t(`apiErrors.${key}`, t("profile.errorFallback")));
    } else {
      setSuccess(true);
      clearSelectedFile();
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-text/70">
          {t("settings.account.displayName")}
        </label>
        <input
          type="text"
          value={nameValue}
          onChange={(e) => setNameValue(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg text-sm text-text bg-button border border-purple-light placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-purple-light transition-all"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-text/70">Bio</label>
        <textarea
          value={bioValue}
          onChange={(e) => setBioValue(e.target.value)}
          rows={4}
          className="w-full px-4 py-2.5 rounded-lg text-sm text-text bg-button border border-purple-light placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-purple-light transition-all resize-none"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-text/70">Avatar URL</label>
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
          Upload avatar
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            setFileValue(file);
            if (file) {
              setAvatarValue("");
            }
          }}
          className="w-full text-sm text-text"
        />
        <p className="text-xs text-text/50">
          If you select a file, it will be used instead of the URL.
        </p>
      </div>

      {error && (
        <p className="text-red-500 text-sm bg-red-500/10 rounded-lg py-2 px-3">
          {error}
        </p>
      )}

      {success && (
        <p className="text-green-600 text-sm bg-green-500/10 rounded-lg py-2 px-3 border border-green-500/20">
          Profile updated successfully.
        </p>
      )}

      <Button type="submit" disabled={loading} className="mt-1">
        {loading ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
