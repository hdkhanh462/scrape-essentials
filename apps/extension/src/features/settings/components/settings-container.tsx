import {
  CheckCircle2Icon,
  CloudUpload,
  History,
  LogOutIcon,
  RotateCcwIcon,
} from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import Loader from "@/components/loader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import type { RestorePayload } from "@/features/backup/types";
import { useImportConfigs } from "@/features/configs/hooks";
import { useImportRecords } from "@/features/records/hooks";
import {
  languageOptions,
  settingsSchema,
  themeOptions,
} from "@/features/settings/schemas/settings";
import {
  DEFAULT_SETTINGS,
  useSettingsStore,
} from "@/features/settings/stores/settings.store";
import type { SettingsInput } from "@/features/settings/types/settings";
import { useDialog } from "@/hooks/use-dialog";
import { formatRelativeTime } from "@/utils/date";
import { toastError } from "@/utils/toast";

export function SettingsContainer() {
  const [restoreInfo, setRestoreInfo] = useState<RestorePayload>();

  const { t } = useTranslation();

  const { debugMode, theme, language, autoBackup, updateSettings } =
    useSettingsStore();
  const { userInfo, lastBackup, logout } = useGoogleStore();

  const restoreConfirmDialog = useDialog();

  const restoreMutation = useRestoreBackup({
    onSuccess: (data) => {
      setRestoreInfo(data);
      restoreConfirmDialog.open();
    },
    onError: (error) => toastError(error, t("message.restoreFailed")),
  });
  const backupMutation = useBackupToDrive({
    onSuccess: () => toast.success(t("message.backupSuccessful")),
    onError: (error) => toastError(error, t("message.backupFailed")),
  });
  const importConfigsMutation = useImportConfigs();
  const importRecordsMutation = useImportRecords();

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
    restoreMutation.mutate();
  };

  const handleRestore = async () => {
    if (!restoreInfo?.payload) return;

    setIsRestoring(true);

    importConfigsMutation.mutate(restoreInfo.payload, {
      onSuccess: () => {
        importRecordsMutation.mutate(restoreInfo.payload.records, {
          onSuccess: () => {
            setIsRestoring(false);
            restoreConfirmDialog.close();
            toast.success(t("message.restoreSuccessful"));
          },
          onError: (error) => {
            setIsRestoring(false);
            toastError(error, t("message.importRecordsFailed"));
          },
        });
      },
      onError: (error) => {
        setIsRestoring(false);
        toastError(error, t("message.failedToImportConfigs"));
      },
    });
  };

  const [isRestoring, setIsRestoring] = useState(false);

  const handleBackup = async () => {
    backupMutation.mutate();
  };

  const handleLogout = async () => {
    logout();
    toast.success(t("message.logoutSuccessful"));
  };

  return (
    <div className="py-8">
      <form onChange={form.handleSubmit(handleSubmit)}>
        <FieldSet>
          <FieldLegend>{t("settings.label")}</FieldLegend>
          <FieldDescription>
            {t("settings.settingsDescription")}
          </FieldDescription>

          <FieldGroup>
            <FieldSeparator />
            <Field orientation="responsive">
              <FieldContent>
                <div className="flex items-center gap-2">
                  <FieldLabel htmlFor="backup">{t("backup.label")}</FieldLabel>
                  <Badge
                    variant="outline"
                    className="gap-1.5 border-green-500/20 bg-green-500/5 px-2 font-normal text-green-600 dark:text-green-400"
                  >
                    <CheckCircle2Icon className="size-3" />
                    Google Drive
                  </Badge>
                </div>
                <FieldDescription className="max-w-100">
                  {t("backup.backupDescription")}
                  <span className="mt-2 flex items-center gap-2 font-medium text-foreground/80 text-xs">
                    <History className="size-3.5 text-muted-foreground" />
                    {t("backup.lastBackup")}:{" "}
                    <span className="font-normal text-muted-foreground">
                      {formatRelativeTime(lastBackup)}
                    </span>
                  </span>
                </FieldDescription>
              </FieldContent>
              <div className="flex min-w-75 flex-col gap-4">
                <div className="flex items-center gap-4 rounded-xl border bg-accent/30 p-3 shadow-xs">
                  {userInfo ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="flex items-center gap-3 overflow-hidden rounded-xl border border-transparent p-2 text-left transition hover:border-border hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <Avatar className="size-10 border-2 border-background shadow-sm">
                            <AvatarImage src={userInfo.picture} />
                          </Avatar>
                          <div className="flex min-w-0 flex-col">
                            <span className="truncate font-semibold text-sm">
                              {userInfo.name}
                            </span>
                            <span className="truncate text-muted-foreground text-xs">
                              {userInfo.email}
                            </span>
                          </div>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-44">
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={handleLogout}
                        >
                          {t("button.logout")}
                          <LogOutIcon />
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <div className="flex items-center gap-3 overflow-hidden">
                      <Avatar className="size-10 border-2 border-background shadow-sm">
                        <AvatarFallback className="bg-primary/10 font-bold text-primary text-xs">
                          N/A
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate font-semibold text-sm">
                          {t("backup.notSignedIn")}
                        </span>
                        <span className="truncate text-muted-foreground text-xs">
                          {t("backup.connectGoogleDrive")}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 shadow-none"
                      disabled={restoreMutation.isPending}
                      onClick={handleRestoreClick}
                    >
                      <Loader isLoading={restoreMutation.isPending} />
                      {!restoreMutation.isPending && (
                        <History className="size-3.5" />
                      )}
                      {t("button.restore")}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 shadow-none"
                      disabled={backupMutation.isPending}
                      onClick={handleBackup}
                    >
                      <Loader isLoading={backupMutation.isPending} />
                      {!backupMutation.isPending && (
                        <CloudUpload className="size-3.5" />
                      )}
                      {t("backup.label")}
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
                      {t("settings.debugMode")}
                    </FieldLabel>
                    <FieldDescription>
                      {t("settings.debugModeDescription")}
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
                  <FieldLabel htmlFor="themes">
                    {t("settings.themes")}
                  </FieldLabel>
                  <FieldDescription>
                    {t("settings.themesDescription")}
                  </FieldDescription>
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
                              {t(`settings.${theme}`)}
                            </FieldTitle>
                            <FieldDescription>
                              {t("settings.themeOptionDescription")}
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
            <Controller
              name="language"
              control={form.control}
              render={({ field, fieldState }) => (
                <FieldSet>
                  <FieldLabel htmlFor="languages">
                    {t("language.label")}
                  </FieldLabel>
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
                              {language === "english"
                                ? "English"
                                : "Tiếng Việt"}
                            </FieldTitle>
                            <FieldDescription>
                              {language === "english"
                                ? "Select your preferred language for the extension interface"
                                : "Chọn ngôn ngữ ưa thích cho giao diện tiện ích"}
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
            />
            <FieldSeparator />
            <Field orientation="responsive">
              <FieldContent>
                <FieldLabel htmlFor="reset-default">
                  {t("settings.resetDefaults")}
                </FieldLabel>
                <FieldDescription>
                  {t("settings.resetDefaultsDescription")}
                </FieldDescription>
              </FieldContent>
              <Button type="button" variant="destructive" onClick={handleReset}>
                <RotateCcwIcon />
                {t("common.reset")}
              </Button>
            </Field>
          </FieldGroup>
        </FieldSet>
      </form>

      <ConfirmDialog
        control={restoreConfirmDialog}
        title={t("dialog.areYouSure")}
        description={t("dialog.restoreConfirmation")}
        onConfirm={handleRestore}
        cancelButton={{
          override: {
            disabled: isRestoring,
          },
        }}
        confirmButton={{
          label: isRestoring ? t("button.restoring") : t("common.confirm"),
          isLoading: isRestoring,
          override: {
            disabled: isRestoring,
          },
        }}
      >
        {restoreInfo?.backupFileName && (
          <p className="mt-3 rounded-md border border-border bg-muted p-3 text-muted-foreground text-sm">
            {t("dialog.restoreFileName", {
              fileName: restoreInfo.backupFileName,
            })}
          </p>
        )}
      </ConfirmDialog>
    </div>
  );
}
