import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { useSettingsStore } from "@/features/settings/stores/settings.store";
import backupEn from "@/locales/en/backup.json";
import buttonEn from "@/locales/en/button.json";
import commonEn from "@/locales/en/common.json";
import configEn from "@/locales/en/config.json";
import dialogEn from "@/locales/en/dialog.json";
import fieldEn from "@/locales/en/field.json";
import languageEn from "@/locales/en/language.json";
import messageEn from "@/locales/en/message.json";
import recordEn from "@/locales/en/record.json";
import settingsEn from "@/locales/en/settings.json";
import tableEn from "@/locales/en/table.json";
import validationEn from "@/locales/en/validation.json";
import backupVi from "@/locales/vi/backup.json";
import buttonVi from "@/locales/vi/button.json";
import commonVi from "@/locales/vi/common.json";
import configVi from "@/locales/vi/config.json";
import dialogVi from "@/locales/vi/dialog.json";
import fieldVi from "@/locales/vi/field.json";
import languageVi from "@/locales/vi/language.json";
import messageVi from "@/locales/vi/message.json";
import recordVi from "@/locales/vi/record.json";
import settingsVi from "@/locales/vi/settings.json";
import tableVi from "@/locales/vi/table.json";
import validationVi from "@/locales/vi/validation.json";

const resources = {
  en: {
    common: commonEn,
    button: buttonEn,
    config: configEn,
    field: fieldEn,
    table: tableEn,
    dialog: dialogEn,
    record: recordEn,
    settings: settingsEn,
    backup: backupEn,
    language: languageEn,
    validation: validationEn,
    message: messageEn,
  },
  vi: {
    common: commonVi,
    button: buttonVi,
    config: configVi,
    field: fieldVi,
    table: tableVi,
    dialog: dialogVi,
    record: recordVi,
    settings: settingsVi,
    backup: backupVi,
    language: languageVi,
    validation: validationVi,
    message: messageVi,
  },
};

i18next.use(initReactI18next).init({
  lng: "en", // if you're using a language detector, do not define the lng option
  debug: useSettingsStore.getState().debugMode,
  resources,
  ns: Object.keys(resources.en),
  defaultNS: "common",
  nsSeparator: ".",
  keySeparator: false,
});

export default i18next;
