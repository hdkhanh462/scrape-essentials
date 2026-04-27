import { I18nextProvider } from "react-i18next";
import { useSettingsStore } from "@/features/settings/stores/settings.store";
import i18nextEN from "@/i18n/config.en";
import i18nextVI from "@/i18n/config.vi";

type Props = React.PropsWithChildren;

export const I18nProvider: React.FC<Props> = ({ children }) => {
  const { language } = useSettingsStore();
  const config = language === "english" ? i18nextEN : i18nextVI;

  return <I18nextProvider i18n={config}>{children}</I18nextProvider>;
};
