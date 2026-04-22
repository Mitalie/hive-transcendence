import i18n, { i18n as I18nType } from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import fi from "./locales/fi.json";
import zh from "./locales/zh.json";

const resources = {
  en: { translation: en },
  fi: { translation: fi },
  zh: { translation: zh },
};

export function createI18n(lng: string): I18nType {
  const instance = i18n.createInstance();
  instance.use(initReactI18next).init({
    resources,
    lng,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
  return instance;
}
