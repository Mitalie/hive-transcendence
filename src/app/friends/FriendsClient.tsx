"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import FriendCard from "./FriendCard";
import IncomingRequestCard from "./IncomingRequestCard";
import SentRequestCard from "./SentRequestCard";
import DiscoverUserCard from "./DiscoverUserCard";

type Person = { id: string; label: string };

interface FriendsClientProps {
  incomingRequests: Person[];
  sentRequests: Person[];
  friends: Person[];
  discoverUsers: Person[];
}

export function FriendsClient({
  incomingRequests,
  sentRequests,
  friends,
  discoverUsers,
}: FriendsClientProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const filteredDiscover = discoverUsers.filter((u) =>
    u.label.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex-1 h-full overflow-y-auto p-4 sm:p-6">
      <div className="h-full flex flex-col lg:flex-row gap-4 max-w-7xl mx-auto">
        {/* ── LEFT COLUMN ── */}
        <div className="flex flex-col gap-4 lg:w-80 xl:w-96 shrink-0">
          {/* Header */}
          <div className="bg-card rounded-2xl border border-purple-light p-6 shadow-xl">
            <h1 className="text-2xl font-bold text-text">
              {t("friends.title")}
            </h1>
            <p className="text-sm text-text/50 mt-1">{t("friends.subtitle")}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: t("friends.stats.friends"), value: friends.length },
              {
                label: t("friends.stats.incoming"),
                value: incomingRequests.length,
              },
              { label: t("friends.stats.sent"), value: sentRequests.length },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="bg-card rounded-2xl border border-purple-light p-4 shadow-xl flex flex-col items-center justify-center text-center gap-1"
              >
                <p className="text-xs text-text/50 leading-tight">{label}</p>
                <p className="text-2xl font-bold text-text">{value}</p>
              </div>
            ))}
          </div>

          {/* Incoming requests */}
          <div className="bg-card rounded-2xl border border-purple-light p-5 shadow-xl flex flex-col gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-text/40">
              {t("friends.incoming.title")}
            </h2>
            {incomingRequests.length === 0 ? (
              <p className="text-sm text-text/50">
                {t("friends.incoming.empty")}
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {incomingRequests.map((f) => (
                  <IncomingRequestCard
                    key={f.id}
                    friendshipId={f.id}
                    label={f.label}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Your friends */}
          <div className="bg-card rounded-2xl border border-purple-light p-5 shadow-xl flex flex-col gap-3 flex-1">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-text/40">
              {t("friends.myFriends.title")}
            </h2>
            {friends.length === 0 ? (
              <p className="text-sm text-text/50">
                {t("friends.myFriends.empty")}
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {friends.map((f) => (
                  <FriendCard key={f.id} friendshipId={f.id} label={f.label} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Search bar */}
          <div className="bg-card rounded-2xl border border-purple-light p-4 shadow-xl">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("friends.discover.searchPlaceholder")}
              className="w-full px-4 py-2.5 rounded-lg text-sm text-text bg-button border border-purple-light placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-purple-light transition-all"
            />
          </div>

          {/* Discover users */}
          <div className="bg-card rounded-2xl border border-purple-light p-5 shadow-xl flex-1">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-text/40 mb-4">
              {t("friends.discover.title")}
            </h2>
            {filteredDiscover.length === 0 ? (
              <p className="text-sm text-text/50">
                {t("friends.discover.empty")}
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredDiscover.map((u) => (
                  <DiscoverUserCard key={u.id} userId={u.id} label={u.label} />
                ))}
              </div>
            )}
          </div>

          {/* Sent requests */}
          <div className="bg-card rounded-2xl border border-purple-light p-5 shadow-xl">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-text/40 mb-4">
              {t("friends.sentRequests.title")}
            </h2>
            {sentRequests.length === 0 ? (
              <p className="text-sm text-text/50">
                {t("friends.sentRequests.empty")}
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {sentRequests.map((f) => (
                  <SentRequestCard
                    key={f.id}
                    friendshipId={f.id}
                    label={f.label}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
