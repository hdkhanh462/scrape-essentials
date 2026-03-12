import { useEffect } from "react";
import { useAppSelector } from "@/lib/redux/store";

export function ThemeProvider({ children }: React.PropsWithChildren) {
  const theme = useAppSelector((s) => s.settings.theme);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  return <>{children}</>;
}
