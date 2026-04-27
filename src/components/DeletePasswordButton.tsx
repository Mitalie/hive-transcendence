"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { deletePasswordAction } from "@/actions/account";

export function DeletePasswordButton() {
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  const handleDelete = async () => {
    setLoading(true);
    const result = await deletePasswordAction();
    if (result.ok) {
      router.refresh();
    }
    setLoading(false);
    setConfirm(false);
  };

  if (confirm) {
    return (
      <div className="flex flex-wrap items-center justify-end gap-2">
        <span className="text-sm text-text/60">
          {t("settings.security.removePasswordConfirm")}
        </span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 disabled:opacity-50 transition-colors"
        >
          {loading
            ? t("settings.security.removing")
            : t("settings.security.confirmRemove")}
        </button>
        <button
          type="button"
          onClick={() => setConfirm(false)}
          disabled={loading}
          className="text-xs font-medium px-2.5 py-1 rounded-full text-text/70 bg-button border border-purple-light hover:text-text transition-colors"
        >
          {t("settings.security.cancel")}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirm(true)}
      className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
    >
      {t("settings.security.removePassword")}
    </button>
  );
}
