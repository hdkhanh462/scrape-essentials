import { CheckCircle2Icon, CloudUpload, History } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import DialogWrapper from "@/components/dialog-wrapper";
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
  languageOptions,
  settingsSchema,
  themseOptions,
} from "@/features/settings/schemas/settings";
import {
  DEFAULT_SETTINGS,
  useSettingsStore,
} from "@/features/settings/stores/settings.store";
import type { SettingsInput } from "@/features/settings/types/settings";
import { sendMessage } from "@/lib/messaging";
import { formatRelativeTime } from "@/utils/date";
import { toastError } from "@/utils/toast";

export function SettingsContainer() {
  const { debugMode, theme, language, autoBackup, updateSettings } =
    useSettingsStore();
  const { userInfo, lastBackup } = useGoogleStore();

  const importConfirmDialog = useDialog();

  const { mutate: restoreBackup, isPending: isRestoring } = useRestoreBackup({
    onSuccess: (data) => {
      setImportPayload(data);
      importConfirmDialog.open();
    },
    onError: (error) => toastError(error, "Restore failed"),
  });
  const { mutate: backupToDrive, isPending: isBackingUp } = useBackupToDrive({
    onSuccess: () => toast.success("Backup successful"),
    onError: (error) => toastError(error, "Backup failed"),
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
    // if (data.autoBackup !== autoBackup)
    //   await sendMessage("autoBackupChange", data.autoBackup);
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
            importConfirmDialog.close();
            toast.success("Restore successful");
          },
          onError: (error) => toastError(error, "Import records failed"),
        });
      },
      onError: (error) => toastError(error, "Import configs failed"),
    });
  };

  const handleBackup = async () => {
    backupToDrive();
  };

  return (
    <div className="py-8">
      <form onChange={form.handleSubmit(handleSubmit)}>
        <FieldSet>
          <FieldLegend>Settings</FieldLegend>
          <FieldDescription>
            Configure your extension settings here.
          </FieldDescription>

          <FieldGroup>
            <FieldSeparator />
            <Field orientation="responsive">
              <FieldContent>
                <div className="flex items-center gap-2">
                  <FieldLabel htmlFor="backup">Backup</FieldLabel>
                  <Badge
                    variant="outline"
                    className="gap-1.5 border-green-500/20 bg-green-500/5 px-2 font-normal text-green-600 dark:text-green-400"
                  >
                    <CheckCircle2Icon className="size-3" />
                    Google Drive
                  </Badge>
                </div>
                <FieldDescription className="max-w-100">
                  Securely backup your settings and configurations to your
                  personal Google Drive account.
                  <span className="mt-2 flex items-center gap-2 font-medium text-foreground/80 text-xs">
                    <History className="size-3.5 text-muted-foreground" />
                    Last backup:{" "}
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
                      Restore
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
                      Backup
                    </Button>
                  </div>
                </div>
              </div>
            </Field>

            {/* {userInfo && (
              <>
                <FieldSeparator />
                <Controller
                  name="autoBackup"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field
                      orientation="horizontal"
                      data-invalid={fieldState.invalid}
                    >
                      <FieldContent>
                        <FieldLabel htmlFor="auto-backup">
                          Auto Backup
                        </FieldLabel>
                        <FieldDescription>
                          Automatically backup your data to Google Drive
                          periodically every day.
                        </FieldDescription>
                      </FieldContent>
                      <Switch
                        id="auto-backup"
                        name={field.name}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-invalid={fieldState.invalid}
                      />
                    </Field>
                  )}
                />
              </>
            )} */}

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
                    <FieldLabel htmlFor="debug-mode">Debug Mode</FieldLabel>
                    <FieldDescription>
                      Enable debug mode for development.
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
                  <FieldLabel htmlFor="themes">Themes</FieldLabel>
                  <FieldDescription>
                    Select your preferred theme for the extension.
                  </FieldDescription>
                  <RadioGroup
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    {themseOptions.map((theme) => (
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
                              Use {theme} theme for better visibility in bright
                              environments.
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
                  <FieldLabel htmlFor="languages">Languages</FieldLabel>
                  <FieldDescription>
                    Choose your preferred language for the extension.
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
                              Use {language} language for all interactions.
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
                <FieldLabel htmlFor="reset-default">Reset Default</FieldLabel>
                <FieldDescription>
                  Reset all settings to their default values.
                </FieldDescription>
              </FieldContent>
              <Button type="button" variant="destructive" onClick={handleReset}>
                Reset
              </Button>
            </Field>
          </FieldGroup>
        </FieldSet>
      </form>

      <DialogWrapper
        title="Are you absolutely sure?"
        description="This action cannot be undone. This will permanently import and overwrite your existing configs."
        open={importConfirmDialog.isOpen}
        onOpenChange={importConfirmDialog.onChange}
        footer={
          <Field orientation="horizontal">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8"
              onClick={importConfirmDialog.close}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="h-8"
              onClick={handleRestore}
            >
              Continue
            </Button>
          </Field>
        }
      />
    </div>
  );
}
