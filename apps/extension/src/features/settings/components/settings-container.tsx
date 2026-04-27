import { CheckCircle2Icon, CloudUpload, History } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import Loader from "@/components/loader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { useBackupToDrive, useRestoreBackup } from "@/features/backup/hooks";
import { useGoogleStore } from "@/features/backup/stores/google.store";
import type { ImportPayload } from "@/features/backup/types";
import { useImportConfigs } from "@/features/configs/hooks";
import { useImportRecords } from "@/features/records/hooks";
import {
  settingsSchema,
  themeOptions,
} from "@/features/settings/schemas/settings";
import {
  DEFAULT_SETTINGS,
  useSettingsStore,
} from "@/features/settings/stores/settings.store";
import type { SettingsInput } from "@/features/settings/types/settings";
import { formatRelativeTime } from "@/utils/date";
import { toastError } from "@/utils/toast";

export function SettingsContainer() {
  const t = browser.i18n.getMessage;

  const { debugMode, theme, language, autoBackup, updateSettings } =
    useSettingsStore();
  const { userInfo, lastBackup } = useGoogleStore();

  const restoreConfirmDialog = useDialog();

  const { mutate: restoreBackup, isPending: isRestoring } = useRestoreBackup({
    onSuccess: (data) => {
      setImportPayload(data);
      restoreConfirmDialog.open();
    },
    onError: (error) => toastError(error, t("restoreFailed")),
  });
  const { mutate: backupToDrive, isPending: isBackingUp } = useBackupToDrive({
    onSuccess: () => toast.success(t("backupSuccessful")),
    onError: (error) => toastError(error, t("backupFailed")),
  });

  const { mutate: importConfigs } = useImportConfigs();
  const { mutate: importRecords } = useImportRecords();

  const [importPayload, setImportPayload] = useState<ImportPayload>();

  const form = useForm<SettingsInput>({
    defaultValues: settingsSchema.parse({
      debugMode,
      theme,
      language,
      autoBackup,
    }),
  });

  const handleSubmit = async (data: SettingsInput) => {
    updateSettings(data);
  };

  const handleReset = () => {
    form.reset(DEFAULT_SETTINGS);
  };

  const handleRestoreClick = async () => {
    restoreBackup();
  };

  const handleRestore = async () => {
    if (!importPayload) return;

    importConfigs(importPayload, {
      onSuccess: () => {
        importRecords(importPayload.records, {
          onSuccess: () => {
            restoreConfirmDialog.close();
            toast.success(t("restoreSuccessful"));
          },
          onError: (error) => toastError(error, t("importRecordsFailed")),
        });
      },
      onError: (error) => toastError(error, t("importConfigsFailed")),
    });
  };

  const handleBackup = async () => {
    backupToDrive();
  };

  return (
    <div className="py-8">
      <form onChange={form.handleSubmit(handleSubmit)}>
        <FieldSet>
          <FieldLegend>{t("settings")}</FieldLegend>
          <FieldDescription>{t("settingsDescription")}</FieldDescription>

          <FieldGroup>
            <FieldSeparator />
            <Field orientation="responsive">
              <FieldContent>
                <div className="flex items-center gap-2">
                  <FieldLabel htmlFor="backup">{t("backup")}</FieldLabel>
                  <Badge
                    variant="outline"
                    className="gap-1.5 border-green-500/20 bg-green-500/5 px-2 font-normal text-green-600 dark:text-green-400"
                  >
                    <CheckCircle2Icon className="size-3" />
                    Google Drive
                  </Badge>
                </div>
                <FieldDescription className="max-w-100">
                  {t("backupDescription")}
                  <span className="mt-2 flex items-center gap-2 font-medium text-foreground/80 text-xs">
                    <History className="size-3.5 text-muted-foreground" />
                    {t("lastBackup")}:{" "}
                    <span className="font-normal text-muted-foreground">
                      {formatRelativeTime(lastBackup)}
                    </span>
                  </span>
                </FieldDescription>
              </FieldContent>
              <div className="flex min-w-75 flex-col gap-4">
                <div className="flex items-center justify-between gap-4 rounded-xl border bg-accent/30 p-3 shadow-xs">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Avatar className="size-10 border-2 border-background shadow-sm">
                      {userInfo?.picture && (
                        <AvatarImage src={userInfo.picture} />
                      )}
                      <AvatarFallback className="bg-primary/10 font-bold text-primary text-xs">
                        {userInfo?.name?.[0] || "N/A"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-semibold text-sm">
                        {userInfo?.name || "Not signed in"}
                      </span>
                      <span className="truncate text-muted-foreground text-xs">
                        {userInfo?.email || "Connect to Google Drive"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 shadow-none"
                      disabled={isRestoring}
                      onClick={handleRestoreClick}
                    >
                      <Loader isLoading={isRestoring} />
                      {!isRestoring && <History className="size-3.5" />}
                      {t("restore")}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 shadow-none"
                      disabled={isBackingUp}
                      onClick={handleBackup}
                    >
                      <Loader isLoading={isBackingUp} />
                      {!isBackingUp && <CloudUpload className="size-3.5" />}
                      {t("backup")}
                    </Button>
                  </div>
                </div>
              </div>
            </Field>

            <FieldSeparator />
            <Controller
              name="debugMode"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  orientation="horizontal"
                  data-invalid={fieldState.invalid}
                >
                  <FieldContent>
                    <FieldLabel htmlFor="debug-mode">
                      {t("debugMode")}
                    </FieldLabel>
                    <FieldDescription>
                      {t("debugModeDescription")}
                    </FieldDescription>
                  </FieldContent>
                  <Switch
                    id="debug-mode"
                    name={field.name}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-invalid={fieldState.invalid}
                  />
                </Field>
              )}
            />
            <FieldSeparator />
            <Controller
              name="theme"
              control={form.control}
              render={({ field, fieldState }) => (
                <FieldSet>
                  <FieldLabel htmlFor="themes">{t("themes")}</FieldLabel>
                  <FieldDescription>{t("themesDescription")}</FieldDescription>
                  <RadioGroup
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    {themeOptions.map((theme) => (
                      <FieldLabel key={theme} htmlFor={theme}>
                        <Field
                          orientation="horizontal"
                          data-invalid={fieldState.invalid}
                        >
                          <FieldContent>
                            <FieldTitle className="capitalize">
                              {theme}
                            </FieldTitle>
                            <FieldDescription>
                              {t("themeOptionDescription")}
                            </FieldDescription>
                          </FieldContent>
                          <RadioGroupItem
                            id={theme}
                            value={theme}
                            aria-invalid={fieldState.invalid}
                          />
                        </Field>
                      </FieldLabel>
                    ))}
                  </RadioGroup>
                </FieldSet>
              )}
            />
            <FieldSeparator />
            {/* <Controller
              name="language"
              control={form.control}
              render={({ field, fieldState }) => (
                <FieldSet>
                  <FieldLabel htmlFor="languages">{t("languages")}</FieldLabel>
                  <FieldDescription>
                    {t("languageDescription")}
                  </FieldDescription>
                  <RadioGroup
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    {languageOptions.map((language) => (
                      <FieldLabel key={language} htmlFor={language}>
                        <Field
                          orientation="horizontal"
                          data-invalid={fieldState.invalid}
                        >
                          <FieldContent>
                            <FieldTitle className="capitalize">
                              {language}
                            </FieldTitle>
                            <FieldDescription>
                              {t("languageOptionDescription")}
                            </FieldDescription>
                          </FieldContent>
                          <RadioGroupItem
                            id={language}
                            value={language}
                            aria-invalid={fieldState.invalid}
                          />
                        </Field>
                      </FieldLabel>
                    ))}
                  </RadioGroup>
                </FieldSet>
              )}
            /> */}
            <FieldSeparator />
            <Field orientation="responsive">
              <FieldContent>
                <FieldLabel htmlFor="reset-default">
                  {t("resetDefaults")}
                </FieldLabel>
                <FieldDescription>
                  {t("resetDefaultsDescription")}
                </FieldDescription>
              </FieldContent>
              <Button type="button" variant="destructive" onClick={handleReset}>
                {t("reset")}
              </Button>
            </Field>
          </FieldGroup>
        </FieldSet>
      </form>

      <ConfirmDialog
        control={restoreConfirmDialog}
        title={t("areYouSure")}
        description={t("restoreConfirmation")}
        onConfirm={handleRestore}
      />
    </div>
  );
}
