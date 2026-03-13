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
import {
  useBackupToDriveMutation,
  useGetUserInfoQuery,
  useRestoreBackupMutation,
} from "@/features/backup/data/backup.api";
import type { ImportPayload } from "@/features/backup/types";
import { configApi } from "@/features/scrape-configs/data/config.api";
import { recordApi } from "@/features/scraped-records/data/record.api";
import {
  languageOptions,
  settingsSchema,
  themseOptions,
} from "@/features/settings/schemas/settings";
import {
  DEFAULT_SETTINGS,
  updateSettings,
} from "@/features/settings/store/settings.slice";
import type { SettingsInput } from "@/features/settings/types/settings";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";
import { CheckCircle2Icon, CloudUpload, History } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

export function SettingsContainer() {
  const dispatch = useAppDispatch();
  const initalValues = useAppSelector((state) => state.settings);

  const importConfirmDialog = useDialog();

  const [restoreBackup, { isLoading: isRestoring }] =
    useRestoreBackupMutation();
  const [backupToDrive, { isLoading: isBackingUp }] =
    useBackupToDriveMutation();
  const { data: userInfo } = useGetUserInfoQuery();

  const [lastBackup, setLastBackup] = useState<number | null>(null);

  useEffect(() => {
    storage.getItem<number | null>("local:lastBackup").then(setLastBackup);
  }, []);
  const [importConfigs] = configApi.useImportConfigsMutation();
  const [importRecords] = recordApi.useImportRecordsMutation();

  const [importPayload, setImportPayload] = useState<ImportPayload>();

  const form = useForm<SettingsInput>({
    defaultValues: settingsSchema.parse(initalValues || {}),
  });

  const handleSubmit = (data: SettingsInput) => {
    dispatch(updateSettings(data));
  };

  const handleReset = () => {
    form.reset(DEFAULT_SETTINGS);
  };

  const handleRestoreClick = async () => {
    try {
      const result = await restoreBackup().unwrap();

      setImportPayload(result);
      importConfirmDialog.open();
    } catch (error) {
      toast.error("Restore failed", {
        description: "Unable to restore backup. Please try again.",
      });
      console.error("Error restoring backup:", error);
    }
  };

  const handleRestore = async () => {
    if (!importPayload) return;

    const { error: importConfigsError } = await importConfigs(importPayload);
    if (importConfigsError) {
      console.error("Error importing configs:", importConfigsError);
      toast.error("Import failed", {
        description: "Please check the file and try again.",
      });
      return;
    }

    const { error: importRecordsError } = await importRecords(
      importPayload.records,
    );
    if (importRecordsError) {
      console.error("Error importing records:", importRecordsError);
      toast.error("Import failed", {
        description: "Please check the file and try again.",
      });
      return;
    }

    importConfirmDialog.close();
    toast.success("Import successful");
  };

  const handleBackup = async () => {
    try {
      await backupToDrive().unwrap();

      const now = Date.now();
      setLastBackup(now);
      toast.success("Backup successful");
    } catch (error) {
      toast.error("Backup failed", {
        description: "Unable to backup settings. Please try again.",
      });
      console.error("Error backing up settings:", error);
    }
  };

  const formatRelativeTime = (timestamp: number | null) => {
    if (!timestamp) return "Never";
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
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
            <Field orientation="horizontal">
              <FieldContent>
                <div className="flex items-center gap-2">
                  <FieldLabel htmlFor="backup">Backup</FieldLabel>
                  <Badge variant="outline">
                    <CheckCircle2Icon className="size-2.5 text-green-500" />
                    Google Drive
                  </Badge>
                </div>
                <FieldDescription>
                  Backup your settings and configurations to Google Drive.
                  <span className="mt-1 text-xs text-muted-foreground flex items-center gap-1.5">
                    <History className="size-3" />
                    Last backup: {formatRelativeTime(lastBackup)}
                  </span>
                </FieldDescription>
              </FieldContent>
              <div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRestoreClick}
                    disabled={isRestoring}
                  >
                    <Loader isLoading={isRestoring} />
                    {!isRestoring && <History className="size-4" />}
                    Restore
                  </Button>
                  <Button
                    type="button"
                    onClick={handleBackup}
                    disabled={isBackingUp}
                  >
                    <Loader isLoading={isBackingUp} />
                    {!isBackingUp && <CloudUpload className="size-4" />}
                    Backup
                  </Button>
                </div>
                {userInfo && (
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage src={userInfo.picture} />
                      <AvatarFallback>{userInfo.name[0]}</AvatarFallback>
                    </Avatar>
                    {userInfo.email}
                  </div>
                )}
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
              onClick={importConfirmDialog.close}
            >
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleRestore}>
              Continue
            </Button>
          </Field>
        }
      />
    </div>
  );
}
