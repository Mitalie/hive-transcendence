import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import fi from "./locales/fi.json";
import zh from "./locales/zh.json";

let isInitialized = false;

export function initI18n() {
  if (!isInitialized) {
    i18n.use(initReactI18next).init({
      resources: {
        en: { translation: en },
        fi: { translation: fi },
        zh: { translation: zh },
      },
      fallbackLng: "en",
      interpolation: { escapeValue: false },
      react: { useSuspense: false },
    });

    isInitialized = true;
  }
}

export default i18n;
