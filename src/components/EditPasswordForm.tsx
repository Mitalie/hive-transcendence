"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import Button from "./Button";
import { updatePasswordAction } from "@/actions/account";

export function EditPasswordForm() {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  const handleClose = () => {
    setOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError(t("settings.security.errorMismatch"));
      return;
    }
    if (newPassword.length < 6) {
      setError(t("settings.security.errorTooShort"));
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    const formData = new FormData();
    formData.append("currentPassword", currentPassword);
    formData.append("newPassword", newPassword);
    formData.append("confirmPassword", confirmPassword);

    const result = await updatePasswordAction(formData);

    if (!result.ok) {
      const errorMap: Record<string, string> = {
        invalid_current_password: t("settings.security.errorCurrentPassword"),
        passwords_mismatch: t("settings.security.errorMismatch"),
        password_too_short: t("settings.security.errorTooShort"),
        missingFields: t("settings.security.errorMissingFields"),
      };
      setError(
        errorMap[result.error ?? ""] ?? t("settings.security.errorGeneric"),
      );
    } else {
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      router.refresh();
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 3000);
    }

    setLoading(false);
  };

  if (!open) {
    return (
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-1 bg-gradient-to-r from-blue-dark to-purple-dark text-white text-sm"
      >
        {t("settings.security.changePassword")}
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-text/70">
          {t("settings.security.currentPassword")}
        </label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => {
            setCurrentPassword(e.target.value);
            setError("");
          }}
          required
          autoComplete="current-password"
          className="w-full px-4 py-2.5 rounded-lg text-sm text-text bg-button border border-purple-light placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-purple-light transition-all"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-text/70">
          {t("settings.security.newPassword")}
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            setError("");
          }}
          required
          autoComplete="new-password"
          className={`w-full px-4 py-2.5 rounded-lg text-sm text-text bg-button border placeholder:text-text/40 focus:outline-none focus:ring-2 transition-all ${
            error === t("settings.security.errorMismatch") ||
            error === t("settings.security.errorTooShort")
              ? "border-red-500/60 focus:ring-red-500/30"
              : "border-purple-light focus:ring-purple-light"
          }`}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-text/70">
          {t("settings.security.confirmPassword")}
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setError("");
          }}
          required
          autoComplete="new-password"
          className={`w-full px-4 py-2.5 rounded-lg text-sm text-text bg-button border placeholder:text-text/40 focus:outline-none focus:ring-2 transition-all ${
            error === t("settings.security.errorMismatch")
              ? "border-red-500/60 focus:ring-red-500/30"
              : "border-purple-light focus:ring-purple-light"
          }`}
        />
      </div>

      {error && (
        <p className="text-red-500 text-sm bg-red-500/10 rounded-lg py-2 px-3">
          {error}
        </p>
      )}

      {success && (
        <p className="text-green-600 text-sm bg-green-500/10 rounded-lg py-2 px-3 border border-green-500/20">
          {t("settings.security.passwordUpdated")}
        </p>
      )}

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={loading}
          className="mt-1 bg-gradient-to-r from-blue-dark to-purple-dark text-white text-base"
        >
          {loading
            ? t("settings.security.saving")
            : t("settings.security.savePassword")}
        </Button>
        <button
          type="button"
          onClick={handleClose}
          disabled={loading}
          className="mt-1 px-4 py-2 rounded-lg text-sm text-text/70 bg-button border border-purple-light hover:text-text transition-colors"
        >
          {t("settings.security.cancel")}
        </button>
      </div>
    </form>
  );
}
