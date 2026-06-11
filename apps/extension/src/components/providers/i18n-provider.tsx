import i18next from "i18next";
import { useEffect } from "react";
import { useSettingsStore } from "@/features/settings/stores/settings.store";

type Props = React.PropsWithChildren;

export const I18nProvider: React.FC<Props> = ({ children }) => {
  const language = useSettingsStore((s) => s.language);

  useEffect(() => {
    const lng = language === "english" ? "en" : "vi";
    i18next.changeLanguage(lng);
  }, [language]);

  return children;
};
