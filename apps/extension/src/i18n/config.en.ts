import i18nextEN from "i18next";
import { initReactI18next } from "react-i18next";
import messagesEN from "@/i18n/locales/en/messages.json";

const resources = {
  en: { translation: messagesEN },
};

i18nextEN.use(initReactI18next).init({
  lng: "en", // if you're using a language detector, do not define the lng option
  debug: true,
  resources,
});

export default i18nextEN;
