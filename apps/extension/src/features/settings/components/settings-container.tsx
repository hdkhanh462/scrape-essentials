import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import DialogWrapper from "@/components/dialog-wrapper";
import Loader from "@/components/loader";
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
import { dexie } from "@/lib/dexie";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";

export function SettingsContainer() {
  const dispatch = useAppDispatch();
  const initalValues = useAppSelector((state) => state.settings);

  const importConfirmDialog = useDialog();

  const [restoreBackup] = useRestoreBackupMutation();
  const [backupToDrive, { isLoading }] = useBackupToDriveMutation();
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
      const configs = await dexie.scrapeConfigs.toArray();
      const fields = await dexie.configFields.toArray();
      const records = await dexie.scrapedRecords.toArray();

      await backupToDrive({
        data: { configs, fields, records },
        version: import.meta.env.VITE_APP_VERSION || "1.0",
      }).unwrap();

      toast.success("Backup successful");
    } catch (error) {
      toast.error("Backup failed", {
        description: "Unable to backup settings. Please try again.",
      });
      console.error("Error backing up settings:", error);
    }
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
                <FieldLabel htmlFor="debug-mode">Backup</FieldLabel>
                <FieldDescription>
                  Backup your settings and configurations to Google Drive.
                </FieldDescription>
              </FieldContent>
              <Button
                type="button"
                variant="outline"
                onClick={handleRestoreClick}
              >
                <Loader isLoading={isLoading} />
                Restore
              </Button>
              <Button type="button" onClick={handleBackup}>
                <Loader isLoading={isLoading} />
                Backup
              </Button>
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
