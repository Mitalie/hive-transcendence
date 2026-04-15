"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTranslation } from "react-i18next";
import Button from "./Button";
import { deleteProfileAction } from "@/actions/account";

export function DeleteProfileButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { t } = useTranslation();

  const handleDelete = async () => {
    const confirmed = window.confirm(t("settings.dangerZone.confirm"));

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError("");

    const result = await deleteProfileAction();

    if (!result.ok) {
      setError(t("settings.dangerZone.error"));
      setLoading(false);
      return;
    }

    await signOut({ redirect: false });
    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p className="text-red-500 text-sm bg-red-500/10 rounded-lg py-2 px-3">
          {error}
        </p>
      )}

      <Button
        type="button"
        disabled={loading}
        onClick={handleDelete}
        className="bg-red-600 hover:bg-red-700 text-base"
      >
        {loading
          ? t("settings.dangerZone.deleting")
          : t("settings.dangerZone.deleteButton")}
      </Button>
    </div>
  );
}
