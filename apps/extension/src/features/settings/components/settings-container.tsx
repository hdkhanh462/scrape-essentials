import {
  CheckCircle2Icon,
  CloudUpload,
  FileDigitIcon,
  History,
  LogOutIcon,
  RotateCcwIcon,
} from "lucide-react";
import { Activity, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { FormSelect } from "@/components/form";
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
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RestoreBackupButton } from "@/features/backup/components/restore-backup-button";
import {
  useBackupList,
  useBackupToDrive,
  useConnectGoogle,
  useDisconnectGoogle,
  useRestoreBackup,
} from "@/features/backup/hooks";
import { useGoogleStore } from "@/features/backup/stores/google.store";
import type { RestorePayload } from "@/features/backup/types";
import { useImportConfigs } from "@/features/configs/hooks";
import { useImportRecords } from "@/features/records/hooks";
import {
  dateFormatOptions,
  languageOptions,
  settingsSchema,
  themeOptions,
  timeFormatOptions,
} from "@/features/settings/schemas/settings";
import {
  DEFAULT_SETTINGS,
  useSettingsStore,
} from "@/features/settings/stores/settings.store";
import type { SettingsInput } from "@/features/settings/types/settings";
import { useDialog } from "@/hooks/use-dialog";
import { formatDateTime, formatRelativeTime } from "@/utils/date";
import { formatBytes } from "@/utils/format-bytes";
import { toastError } from "@/utils/toast";

export function SettingsContainer() {
  const [restoreInfo, setRestoreInfo] = useState<RestorePayload>();

  const { t } = useTranslation();

  const {
    debugMode,
    theme,
    language,
    versionedBackup,
    versionedBackupMinIntervalHours,
    maxBackupsToKeep,
    updateSettings,
  } = useSettingsStore();
  const { userInfo, lastBackup } = useGoogleStore();

  const restoreConfirmDialog = useDialog();

  const backupListQuery = useBackupList();
  const totalBackupSize = backupListQuery.data?.reduce(
    (sum, backup) => sum + backup.size,
    0,
  );
  const connectMutation = useConnectGoogle({
    onSuccess: () => toast.success(t("message:connectSuccessful")),
    onError: (error) => toastError(error, t("message:connectFailed")),
  });
  const disconnectMutation = useDisconnectGoogle({
    onSuccess: () => toast.success(t("message:disconnectSuccessful")),
    onError: (error) => toastError(error, t("message:disconnectFailed")),
  });
  const restoreMutation = useRestoreBackup({
    onSuccess: (data) => {
      setRestoreInfo(data);
      restoreConfirmDialog.open();
    },
    onError: (error) => toastError(error, t("message:restoreFailed")),
  });
  const backupMutation = useBackupToDrive({
    onSuccess: () => toast.success(t("message:backupSuccessful")),
    onError: (error) => toastError(error, t("message:backupFailed")),
  });
  const importConfigsMutation = useImportConfigs();
  const importRecordsMutation = useImportRecords();

  const form = useForm<SettingsInput>({
    defaultValues: settingsSchema.parse({
      debugMode,
      theme,
      language,
      versionedBackup,
      versionedBackupMinIntervalHours,
      maxBackupsToKeep,
    }),
  });

  const watchVersionedBackup = form.watch("versionedBackup");

  const handleSubmit = async (data: SettingsInput) => {
    updateSettings(data);
  };

  const handleReset = () => {
    form.reset(DEFAULT_SETTINGS);
  };

  const handleRestoreClick = (fileId?: string) => {
    restoreMutation.mutate(fileId);
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
            toast.success(t("message:restoreSuccessful"));
          },
          onError: (error) => {
            setIsRestoring(false);
            toastError(error, t("message:importRecordsFailed"));
          },
        });
      },
      onError: (error) => {
        setIsRestoring(false);
        toastError(error, t("message:failedToImportConfigs"));
      },
    });
  };

  const [isRestoring, setIsRestoring] = useState(false);

  const handleBackup = async () => {
    backupMutation.mutate();
  };

  const handleConnect = async () => {
    connectMutation.mutate();
  };

  const handleDisconnect = async () => {
    disconnectMutation.mutate();
  };

  return (
    <div className="py-8">
      <form onChange={form.handleSubmit(handleSubmit)}>
        <FieldSet>
          <FieldLegend>{t("settings:label")}</FieldLegend>
          <FieldDescription>
            {t("settings:settingsDescription")}
          </FieldDescription>

          <FieldGroup>
            <FieldSeparator />
            <Field orientation="responsive">
              <FieldContent>
                <div className="flex items-center gap-2">
                  <FieldLabel htmlFor="backup">{t("backup:label")}</FieldLabel>
                  <Badge
                    variant="outline"
                    className="gap-1.5 border-green-500/20 bg-green-500/5 px-2 font-normal text-green-600 dark:text-green-400"
                  >
                    <CheckCircle2Icon className="size-3" />
                    Google Drive
                  </Badge>
                </div>
                <FieldDescription className="max-w-100">
                  {t("backup:backupDescription")}
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 font-medium text-foreground/80 text-xs">
                      <History className="size-3.5 text-muted-foreground" />
                      {t("backup:lastBackup")}:{" "}
                      <span className="font-normal text-muted-foreground">
                        {formatRelativeTime(lastBackup)}
                      </span>
                    </span>
                    {userInfo && (
                      <span className="flex items-center gap-2 font-medium text-foreground/80 text-xs">
                        <FileDigitIcon className="size-3.5 text-muted-foreground" />
                        {t("backup:size")}:{" "}
                        <span className="font-normal text-muted-foreground">
                          {backupListQuery.isLoading
                            ? "…"
                            : totalBackupSize
                              ? `${formatBytes(totalBackupSize)}`
                              : t("backup:noBackupYet")}
                        </span>
                      </span>
                    )}
                  </div>
                </FieldDescription>
              </FieldContent>
              <div className="flex min-w-75 flex-col gap-4">
                <div className="flex items-center gap-4 rounded-xl border bg-accent/30 p-3 shadow-xs">
                  {userInfo ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        nativeButton={false}
                        render={
                          <div className="flex items-center gap-3 overflow-hidden rounded-xl p-2 text-left hover:cursor-pointer hover:bg-accent hover:shadow-sm">
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
                          </div>
                        }
                      />
                      <DropdownMenuContent align="start" className="w-44">
                        <DropdownMenuItem
                          variant="destructive"
                          className="justify-between"
                          onClick={handleDisconnect}
                          disabled={disconnectMutation.isPending}
                        >
                          {t("backup:disconnect")}
                          <LogOutIcon />
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <button
                      type="button"
                      className="flex items-center gap-3 overflow-hidden rounded-xl p-2 text-start text-muted-foreground hover:bg-accent hover:shadow-sm disabled:cursor-not-allowed"
                      disabled={connectMutation.isPending}
                      onClick={handleConnect}
                    >
                      <Avatar className="size-10 border-2 border-background shadow-sm">
                        <AvatarFallback className="bg-primary/10 font-bold text-primary text-xs">
                          N/A
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate font-semibold text-sm">
                          {t("backup:notSignedIn")}
                        </span>
                        <span className="truncate text-muted-foreground text-xs">
                          {t("backup:connectGoogleDrive")}
                        </span>
                      </div>
                      <Loader isLoading={connectMutation.isPending} />
                    </button>
                  )}
                  <div className="flex gap-2">
                    <RestoreBackupButton
                      disabled={!userInfo}
                      isPending={restoreMutation.isPending}
                      onRestore={handleRestoreClick}
                    />
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 shadow-none"
                      disabled={!userInfo || backupMutation.isPending}
                      onClick={handleBackup}
                    >
                      <Loader isLoading={backupMutation.isPending} />
                      {!backupMutation.isPending && (
                        <CloudUpload className="size-3.5" />
                      )}
                      {t("backup:label")}
                    </Button>
                  </div>
                </div>
              </div>
            </Field>

            <FieldSeparator />
            <Controller
              name="versionedBackup"
              control={form.control}
              render={({ field, fieldState }) => (
                <FieldSet>
                  <Field
                    orientation="horizontal"
                    data-invalid={fieldState.invalid}
                  >
                    <FieldContent>
                      <FieldLabel htmlFor="versioned-backup">
                        {t("backup:versionedBackup")}
                      </FieldLabel>
                      <FieldDescription>
                        {t("backup:versionedBackupDescription")}
                      </FieldDescription>
                    </FieldContent>
                    <Switch
                      id="versioned-backup"
                      name={field.name}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-invalid={fieldState.invalid}
                    />
                  </Field>
                  <Activity mode={watchVersionedBackup ? "visible" : "hidden"}>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <Controller
                        name="versionedBackupMinIntervalHours"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="versioned-backup-interval">
                              {t("backup:minIntervalHours")}
                            </FieldLabel>
                            <Input
                              id="versioned-backup-interval"
                              type="number"
                              min={1}
                              max={720}
                              name={field.name}
                              value={field.value}
                              onChange={(e) =>
                                field.onChange(e.target.valueAsNumber)
                              }
                              aria-invalid={fieldState.invalid}
                            />
                          </Field>
                        )}
                      />
                      <Controller
                        name="maxBackupsToKeep"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="max-backups-to-keep">
                              {t("backup:maxBackupsToKeep")}
                            </FieldLabel>
                            <Input
                              id="max-backups-to-keep"
                              type="number"
                              min={1}
                              max={100}
                              name={field.name}
                              value={field.value}
                              onChange={(e) =>
                                field.onChange(e.target.valueAsNumber)
                              }
                              aria-invalid={fieldState.invalid}
                            />
                          </Field>
                        )}
                      />
                    </div>
                  </Activity>
                </FieldSet>
              )}
            />
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
                      {t("settings:debugMode")}
                    </FieldLabel>
                    <FieldDescription>
                      {t("settings:debugModeDescription")}
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
                    {t("settings:themes")}
                  </FieldLabel>
                  <FieldDescription>
                    {t("settings:themesDescription")}
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
                              {t(`settings:${theme}`)}
                            </FieldTitle>
                            <FieldDescription>
                              {t("settings:themeOptionDescription")}
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
                    {t("language:label")}
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
            <FieldSet>
              <FieldLabel htmlFor="date-time-format">
                {t("settings:dateTimeFormat")}
              </FieldLabel>
              <FieldDescription>
                {t("settings:dateTimeFormatDescription")}
              </FieldDescription>
              <div className="grid grid-cols-2 gap-4">
                <FormSelect
                  control={form.control}
                  name="dateFormat"
                  label={t("settings:dateFormat")}
                  inputProps={{
                    children: dateFormatOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {
                          formatDateTime(Date.now(), {
                            dateFormat: option,
                            timeFormat: "24h",
                          }).split(" ")[0]
                        }
                      </SelectItem>
                    )),
                  }}
                />
                <FormSelect
                  control={form.control}
                  name="timeFormat"
                  label={t("settings:timeFormat")}
                  inputProps={{
                    children: timeFormatOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option === "24h"
                          ? t("settings:timeFormat24h")
                          : t("settings:timeFormat12h")}
                      </SelectItem>
                    )),
                  }}
                />
              </div>
            </FieldSet>
            <FieldSeparator />
            <Field orientation="responsive">
              <FieldContent>
                <FieldLabel htmlFor="reset-default">
                  {t("settings:resetDefaults")}
                </FieldLabel>
                <FieldDescription>
                  {t("settings:resetDefaultsDescription")}
                </FieldDescription>
              </FieldContent>
              <Button type="button" variant="destructive" onClick={handleReset}>
                <RotateCcwIcon />
                {t("common:reset")}
              </Button>
            </Field>
          </FieldGroup>
        </FieldSet>
      </form>

      <ConfirmDialog
        control={restoreConfirmDialog}
        title={t("dialog:areYouSure")}
        description={t("dialog:restoreConfirmation")}
        onConfirm={handleRestore}
        cancelButton={{
          override: {
            disabled: isRestoring,
          },
        }}
        confirmButton={{
          label: isRestoring ? t("button:restoring") : t("common:confirm"),
          isLoading: isRestoring,
          override: {
            disabled: isRestoring,
          },
        }}
      >
        {restoreInfo?.modifiedTime && (
          <p className="mt-3 rounded-md border border-border bg-muted p-3 text-muted-foreground text-sm">
            {t("dialog:restoreBackupInfo", {
              time: formatRelativeTime(
                new Date(restoreInfo.modifiedTime).getTime(),
              ),
            })}
          </p>
        )}
      </ConfirmDialog>
    </div>
  );
}
