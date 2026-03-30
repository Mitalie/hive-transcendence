"use client";

import { useTranslation } from "react-i18next";

export default function PrivacyPolicy() {
  const { t } = useTranslation();

  const sections = [
    { index: "01", key: "dataCollected" },
    { index: "02", key: "githubOAuth" },
    { index: "03", key: "dataUse" },
    { index: "04", key: "dataStorage" },
    { index: "05", key: "dataSharing" },
    { index: "06", key: "cookies" },
    { index: "07", key: "rights" },
    { index: "08", key: "contact" },
  ];

  return (
    <main className="min-h-screen bg-white dark:bg-black text-black dark:text-white px-6 py-16 font-mono transition-colors duration-300">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-12 border-b border-black/10 dark:border-white/10 pb-8">
          <p className="text-xs text-black/40 dark:text-white/40 uppercase tracking-widest mb-3">
            Transcendence
          </p>
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            {t("privacy.title")}
          </h1>
          <p className="text-sm text-black/40 dark:text-white/40">
            {t("privacy.lastUpdated")}
          </p>
        </div>

        {/* Intro */}
        <p className="text-black/70 dark:text-white/70 leading-relaxed mb-12">
          {t("privacy.intro")}
        </p>

        {/* Sections */}
        <div className="space-y-10">
          {sections.map(({ index, key }) => (
            <Section
              key={key}
              index={index}
              title={t(`privacy.sections.${key}.title`)}
              content={t(`privacy.sections.${key}.content`)}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

function Section({
  index,
  title,
  content,
}: {
  index: string;
  title: string;
  content: string;
}) {
  return (
    <div className="grid grid-cols-[2rem_1fr] gap-4 items-start">
      <span className="text-xs text-black/25 dark:text-white/25 pt-1 select-none">
        {index}
      </span>
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-black/60 dark:text-white/60 mb-2">
          {title}
        </h2>
        <p className="text-black/80 dark:text-white/80 leading-relaxed text-sm">
          {content}
        </p>
      </div>
    </div>
  );
}
