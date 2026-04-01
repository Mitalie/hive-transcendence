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
    <main className="w-full h-full px-6 py-16 font-mono text-left text-text overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-12 border-b border-text/10 pb-8">
          <p className="text-xs text-text/40 uppercase tracking-widest mb-3">
            Transcendence
          </p>
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            {t("privacy.title")}
          </h1>
          <p className="text-sm text-text/40">{t("privacy.lastUpdated")}</p>
        </div>

        {/* Intro */}
        <p className="text-text/70 leading-relaxed mb-12">
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
      <span className="text-xs text-text/25 pt-1 select-none">{index}</span>
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text/60 mb-2">
          {title}
        </h2>
        <p className="text-text/80 eading-relaxed text-sm">{content}</p>
      </div>
    </div>
  );
}
