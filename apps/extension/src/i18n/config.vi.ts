import i18nextVI from "i18next";
import { initReactI18next } from "react-i18next";
import messagesVI from "@/i18n/locales/vi/messages.json";

const resources = {
  vi: { translation: messagesVI },
};

i18nextVI.use(initReactI18next).init({
  lng: "vi", // if you're using a language detector, do not define the lng option
  debug: true,
  resources,
});

export default i18nextVI;
