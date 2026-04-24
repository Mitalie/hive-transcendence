"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import FriendCard from "./FriendCard";
import RequestCard from "./RequestCard";
import DiscoverUserCard from "./DiscoverUserCard";
import FriendProfile from "./FriendProfile";
import { searchUsersForFriendRequest } from "@/actions/users";

type Person = {
  id: string;
  label: string;
  avatarUrl?: string | null;
  isOnline: boolean;
};
type ActiveTab = "friends" | "incoming" | "sent";

interface FriendsClientProps {
  incomingRequests: Person[];
  sentRequests: Person[];
  friends: Person[];
}

interface TabConfig {
  key: ActiveTab;
  labelKey: string;
  count: number;
}

const REFRESH_INTERVAL_MS = 60_000;

function TabButton({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 rounded-2xl p-4 cursor-pointer transition-all ${
        active
          ? "bg-gradient-to-r from-blue-dark to-purple-dark text-white"
          : "bg-card text-text"
      }`}
    >
      <p
        className={`text-xs leading-tight ${active ? "text-white/70" : "text-text/50"}`}
      >
        {label}
      </p>
      <p className="text-2xl font-bold">{count}</p>
    </button>
  );
}

export function FriendsClient({
  incomingRequests,
  sentRequests,
  friends,
}: FriendsClientProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<ActiveTab>("friends");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedFromSearch, setSelectedFromSearch] = useState(false);

  const [searchResults, setSearchResults] = useState<Person[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchRef = useRef(search);
  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string | null>(null);

  const friendIds = new Set(friends.map((f) => f.id));

  const runSearch = useCallback(async (keyword: string) => {
    const trimmed = keyword.trim();
    if (trimmed === "") {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    const results = await searchUsersForFriendRequest(trimmed);
    setSearchResults(
      results.map((u) => ({
        ...u,
        avatarUrl: `/api/avatar/${u.id}`,
        isOnline: false,
      })),
    );
    setIsSearching(false);
  }, []);

  const doRefresh = useCallback(() => {
    setIsRefreshing(true);
    setLastUpdatedTime(new Date().toLocaleTimeString());
    router.refresh();
    runSearch(searchRef.current);
    setTimeout(() => setIsRefreshing(false), 800);
  }, [router, runSearch]);

  useEffect(() => {
    if (isRefreshing) return;
    const timeout = setTimeout(doRefresh, REFRESH_INTERVAL_MS);
    return () => clearTimeout(timeout);
  }, [doRefresh, isRefreshing]);

  const handleManualRefresh = () => {
    doRefresh();
  };

  // Search effect (debounced, triggered by typing)
  useEffect(() => {
    const trimmed = search.trim();
    if (trimmed === "") return;

    const debounceTimeout = setTimeout(() => {
      setIsSearching(true);
      runSearch(trimmed);
    }, 300);

    return () => {
      clearTimeout(debounceTimeout);
    };
  }, [search, runSearch]);

  const allListPersons = [...friends, ...incomingRequests, ...sentRequests];
  const uniqueListPersons = Array.from(
    new Map(allListPersons.map((p) => [p.id, p])).values(),
  );

  const selectedPerson = selectedId
    ? (uniqueListPersons.find((p) => p.id === selectedId) ??
      searchResults.find((p) => p.id === selectedId) ??
      null)
    : null;

  const selectFromList = (p: Person) => {
    setSelectedId(p.id);
    setSelectedFromSearch(false);
    setSearch("");
    setSearchResults([]);
  };

  const selectFromSearch = (p: Person) => {
    setSelectedId(p.id);
    setSelectedFromSearch(true);
  };

  const closeProfile = () => {
    setSelectedId(null);
    if (!selectedFromSearch) setSearch("");
    setSelectedFromSearch(false);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (value.trim() === "") {
      setSearchResults([]);
      setIsSearching(false);
    }
    if (!selectedFromSearch) {
      setSelectedId(null);
    } else if (value !== search) {
      setSelectedId(null);
      setSelectedFromSearch(false);
    }
  };

  const tabs: TabConfig[] = [
    {
      key: "friends",
      labelKey: "friends.stats.friends",
      count: friends.length,
    },
    {
      key: "incoming",
      labelKey: "friends.stats.incoming",
      count: incomingRequests.length,
    },
    { key: "sent", labelKey: "friends.stats.sent", count: sentRequests.length },
  ];

  const listContent: Record<ActiveTab, React.ReactNode> = {
    friends: (
      <>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text/40">
          {t("friends.myFriends.title")}
        </h2>
        {friends.length === 0 ? (
          <p className="text-sm text-text/50">{t("friends.myFriends.empty")}</p>
        ) : (
          <div className="flex flex-col gap-3">
            {friends.map((f) => (
              <FriendCard
                key={f.id}
                friendshipId={f.id}
                label={f.label}
                avatarUrl={f.avatarUrl}
                isOnline={f.isOnline}
                onSelect={() => selectFromList(f)}
                isSelected={selectedId === f.id}
              />
            ))}
          </div>
        )}
      </>
    ),
    incoming: (
      <>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text/40">
          {t("friends.incoming.title")}
        </h2>
        {incomingRequests.length === 0 ? (
          <p className="text-sm text-text/50">{t("friends.incoming.empty")}</p>
        ) : (
          <div className="flex flex-col gap-3">
            {incomingRequests.map((f) => (
              <RequestCard
                key={f.id}
                friendshipId={f.id}
                label={f.label}
                avatarUrl={f.avatarUrl}
                isOnline={f.isOnline}
                variant="incoming"
                isSelected={selectedId === f.id}
                onViewProfile={() => selectFromList(f)}
              />
            ))}
          </div>
        )}
      </>
    ),
    sent: (
      <>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text/40">
          {t("friends.sentRequests.title")}
        </h2>
        {sentRequests.length === 0 ? (
          <p className="text-sm text-text/50">
            {t("friends.sentRequests.empty")}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {sentRequests.map((f) => (
              <RequestCard
                key={f.id}
                friendshipId={f.id}
                label={f.label}
                avatarUrl={f.avatarUrl}
                isOnline={f.isOnline}
                variant="sent"
                isSelected={selectedId === f.id}
                onViewProfile={() => selectFromList(f)}
                onSuccess={() => {
                  doRefresh();
                  runSearch(searchRef.current);
                }}
              />
            ))}
          </div>
        )}
      </>
    ),
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
      <div
        className="flex flex-col lg:flex-row gap-4 max-w-7xl mx-auto lg:h-full"
        style={{ minHeight: "600px" }}
      >
        {/* ── LEFT COLUMN ── */}
        <div className="flex flex-col gap-4 lg:w-80 xl:w-96 shrink-0 min-h-0">
          <div className="bg-card rounded-2xl p-6 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text">
                {t("friends.title")}
              </h1>
              <p className="text-sm text-text/50 mt-1">
                {t("friends.subtitle")}
              </p>
            </div>
            {/* Refresh button */}
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              title={
                lastUpdatedTime
                  ? t("friends.lastUpdated", { time: lastUpdatedTime })
                  : undefined
              }
              className="shrink-0 mt-1 rounded-lg p-2 text-text/50 hover:text-text hover:bg-purple-light/20 transition-colors disabled:opacity-40"
            >
              <svg
                className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path d="M21 2v6h-6" />
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                <path d="M3 22v-6h6" />
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-3 gap-3">
            {tabs.map(({ key, labelKey, count }) => (
              <TabButton
                key={key}
                active={activeTab === key}
                label={t(labelKey)}
                count={count}
                onClick={() => setActiveTab(key)}
              />
            ))}
          </div>

          {/* List panel */}
          <div className="bg-card rounded-2xl p-5 flex flex-col gap-3 flex-1 overflow-y-auto min-h-0">
            {listContent[activeTab]}
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="flex-1 flex flex-col gap-4 min-w-0 min-h-0 overflow-hidden">
          {/* Search bar */}
          <div className="bg-card rounded-2xl p-6">
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={t("friends.discover.searchPlaceholder")}
              className="w-full px-4 py-3 rounded-lg text-lg text-text bg-button border border-purple-light placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-purple-light transition-all"
            />
          </div>

          {/* Profile or Discover panel */}
          {selectedPerson ? (
            <FriendProfile
              friend={selectedPerson}
              isFriend={friendIds.has(selectedPerson.id)}
              onClose={closeProfile}
            />
          ) : (
            <div className="bg-card rounded-2xl p-5 flex-1 overflow-y-auto min-h-0">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-text/40 mb-4">
                {t("friends.discover.title")}
              </h2>
              {search.trim() === "" ? (
                <p className="text-sm text-text/50">
                  {t("friends.discover.searchHint", {
                    defaultValue: "Search for people above to find them.",
                  })}
                </p>
              ) : isSearching ? (
                <p className="text-sm text-text/50">
                  {t("friends.discover.searching", {
                    defaultValue: "Searching...",
                  })}
                </p>
              ) : searchResults.length === 0 ? (
                <p className="text-sm text-text/50">
                  {t("friends.discover.empty")}
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {searchResults.map((u) => (
                    <DiscoverUserCard
                      key={u.id}
                      userId={u.id}
                      label={u.label}
                      avatarUrl={`/api/avatar/${u.id}`}
                      isSelected={selectedId === u.id}
                      onSelect={() => selectFromSearch(u)}
                      onSuccess={() => {
                        doRefresh();
                        runSearch(searchRef.current);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
