import i18nextEN from "i18next";
import { initReactI18next } from "react-i18next";
import { useSettingsStore } from "@/features/settings/stores/settings.store";
import messagesEN from "@/i18n/locales/en/messages.json";
import messagesVI from "@/i18n/locales/vi/messages.json";

i18nextEN.use(initReactI18next).init({
  lng: "en", // if you're using a language detector, do not define the lng option
  debug: useSettingsStore.getState().debugMode,
  resources: {
    en: { translation: messagesEN },
    vi: { translation: messagesVI },
  },
});

export default i18nextEN;
