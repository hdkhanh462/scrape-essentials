import { closestCenter, DndContext, type DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeftIcon,
  CheckIcon,
  ClipboardPasteIcon,
  RotateCcwIcon,
  SaveIcon,
  XIcon,
} from "lucide-react";
import { Activity, useEffect, useMemo } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { FormInput, FormSwitch } from "@/components/form";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import SortableFieldItem from "@/features/configs/components/sortable-field-item";
import {
  useAddConfig,
  useEditConfig,
  useGetConfigById,
} from "@/features/configs/hooks";
import { ConfigSchema } from "@/features/configs/schemas";
import { useConfigStore } from "@/features/configs/stores/config.store";
import type { ConfigInput } from "@/features/configs/types/form-input";
import { FieldSheetForm } from "@/features/fields/components/field-sheet-form";
import {
  useAddField,
  useDeleteField,
  useEditField,
  useGetFields,
} from "@/features/fields/hooks";
import type { FieldInput } from "@/features/fields/types/form-input";
import { useDialog } from "@/hooks/use-dialog";
import { usePasteFromClipboard } from "@/hooks/use-paste-from-clipboard";
import type { ConfigField } from "@/lib/dexie";
import { dbFieldToFieldInput } from "@/utils/converts";
import { logger } from "@/utils/logger";
import { toastError } from "@/utils/toast";

const DEFAULT_VALUES: Partial<ConfigInput> = {
  name: "",
  domains: [
    {
      value: "",
    },
  ],
  isActive: true,
  fields: [],
};

export const ConfigDetail = () => {
  const { t } = useTranslation();

  const addFieldDialog = useDialog();
  const { mode, configId } = useConfigStore();
  const { reset } = useConfigStore((state) => state.actions);

  const configQuery = useGetConfigById({ id: configId || "" });
  const fieldsQuery = useGetFields({ configId: configId || "" });
  const addFieldMutation = useAddField();
  const editFieldMutation = useEditField();
  const deleteFieldMutation = useDeleteField();
  const addConfigMutation = useAddConfig({
    onSuccess: () => {
      toast.success(t("message.configAddedSuccessfully"));
    },
    onError: (error) => toastError(error, t("message.failedToAddConfig")),
  });
  const editConfigMutation = useEditConfig({
    onSuccess: () => {
      toast.success(t("message.configUpdatedSuccessfully"));
    },
    onError: (error) => toastError(error, t("message.failedToUpdateConfig")),
  });

  const config = useMemo<ConfigInput | undefined>(() => {
    if (!configQuery.data) return undefined;

    return {
      ...configQuery.data,
      domains: configQuery.data.domains.map((domain) => ({ value: domain })),
      fields: fieldsQuery.data
        ? fieldsQuery.data.map((field) => dbFieldToFieldInput(field, field.id))
        : [],
    };
  }, [configQuery.data, fieldsQuery.data]);

  const form = useForm<ConfigInput>({
    resolver: zodResolver(ConfigSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const domainsFieldArray = useFieldArray({
    control: form.control,
    name: "domains",
  });

  const fieldsFieldArray = useFieldArray({
    control: form.control,
    name: "fields",
  });

  const pasteConfig = usePasteFromClipboard({
    onPaste: (text) => {
      let valueFromClipboard: unknown;

      try {
        valueFromClipboard = JSON.parse(text);
      } catch (error) {
        toast.error(t("message.invalidJsonFormat"), {
          description:
            error instanceof Error ? error.message : t("message.unknownError"),
        });
        return;
      }

      const { data, error } = ConfigSchema.safeParse(valueFromClipboard);
      if (error) {
        logger.error("Error parsing config from clipboard:", error);
        toast.error(t("message.pasteFailed"), {
          description: () => (
            <ul>
              {error.issues.map((err) => (
                <li key={err.code}>
                  {err.path.join(".")}: {err.message}
                </li>
              ))}
            </ul>
          ),
        });
        return;
      }
      form.reset(data, {
        keepDefaultValues: true,
      });
    },
  });

  useEffect(() => {
    if (config) form.reset(config);
  }, [config, form.reset]);

  const handleSubmit = async (input: ConfigInput) => {
    logger.debug("ConfigDetail - Submitting form:", input);

    if (mode === "edit") {
      if (!configId) {
        toast.error(t("configIdMissingForEdit"));
        return;
      }
      editConfigMutation.mutate({ id: configId, data: input });
      form.reset(input);
    } else {
      addConfigMutation.mutate(input);
      form.reset();
    }
  };

  const handleAddField = async (data: FieldInput) => {
    let toAdd = {
      ...data,
      order: fieldsFieldArray.fields.length,
    };

    logger.debug("Adding field with data:", {
      data,
      toAdd,
    });

    if (!configId) {
      fieldsFieldArray.append(toAdd);
      addFieldDialog.close();
      return;
    }

    await addFieldMutation.mutateAsync(
      { ...toAdd, configId },
      {
        onSuccess: (newFieldId) => {
          toAdd = { ...toAdd, fieldId: newFieldId };

          fieldsFieldArray.append(toAdd);
          addFieldDialog.close();
          toast.success(t("message.fieldAddedSuccessfully"));
          logger.debug("Added field with id:", {
            newFieldId,
            toAdd,
          });
        },
        onError: (error) => toastError(error, "Failed to add field"),
      },
    );
  };

  const handleEditField = async (
    index: number,
    data: FieldInput,
    id?: ConfigField["id"],
  ) => {
    logger.debug("Editing field with data:", {
      index,
      data,
      id,
    });

    if (!configId || !id) {
      form.setValue(`fields.${index}`, data);
      return;
    }

    await editFieldMutation.mutateAsync(
      { id, data: { ...data, configId } },
      {
        onSuccess: () => {
          form.setValue(`fields.${index}`, data);
          toast.success(t("message.fieldUpdatedSuccessfully"));
          logger.debug("Updated field with id:", id);
        },
        onError: (error) => toastError(error, t("message.failedToUpdateField")),
      },
    );
  };

  const handleDeleteField = async (index: number, id?: ConfigField["id"]) => {
    if (!configId || !id) {
      fieldsFieldArray.remove(index);
      return;
    }

    await deleteFieldMutation.mutateAsync(id, {
      onSuccess: () => {
        fieldsFieldArray.remove(index);
        toast.success(t("message.fieldDeletedSuccessfully"));
        logger.debug("Deleted field with id:", id);
      },
      onError: (error) => toastError(error, t("message.failedToDeleteField")),
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const activeIndex = fieldsFieldArray.fields.findIndex(
      (field) => field.id === active.id,
    );
    const overIndex = fieldsFieldArray.fields.findIndex(
      (field) => field.id === over.id,
    );

    if (activeIndex === -1 || overIndex === -1) return;

    fieldsFieldArray.move(activeIndex, overIndex);

    fieldsFieldArray.fields.forEach((_, index) => {
      form.setValue(`fields.${index}.order`, index);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={reset}>
            <ArrowLeftIcon />
            {t("common.back")}
          </Button>
          <h2 className="font-semibold text-base">
            {mode === "edit"
              ? `${t("button.edit")} ${t("config.label")}`
              : `${t("button.add")} ${t("config.label")}`}
          </h2>
        </div>
        {/* Action Buttons */}
        <Field orientation="horizontal" className="w-fit">
          {mode === "add" && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8"
              onClick={pasteConfig.paste}
            >
              <Loader
                isLoading={pasteConfig.isPasted}
                fallback={
                  <>
                    <CheckIcon />
                    {t("button.pasted")}
                  </>
                }
              >
                <ClipboardPasteIcon />
                {t("button.paste")}
              </Loader>
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => form.reset()}
          >
            <RotateCcwIcon />
            {t("common.reset")}
          </Button>
          <Button
            type="submit"
            form="config-form"
            size="sm"
            className="h-8"
            disabled={!form.formState.isDirty}
          >
            <SaveIcon />
            {mode === "edit" ? t("button.save") : t("button.add")}
          </Button>
        </Field>
      </div>
      <form id="config-form" onSubmit={form.handleSubmit(handleSubmit)}>
        <FieldGroup>
          <FormInput
            control={form.control}
            name="name"
            label={t("config.configName")}
            inputProps={{
              placeholder: t("config.enterConfigName"),
              autoComplete: "off",
            }}
          />

          <FormSwitch
            control={form.control}
            name="isActive"
            label={t("common.active")}
          />

          <div className="grid grid-cols-2 gap-4">
            {/* Domains */}
            <FieldSet>
              <FieldLegend className="text-sm!">
                {t("config.domains")}
              </FieldLegend>
              <FieldGroup className="gap-3">
                {domainsFieldArray.fields.map((item, index) => (
                  <Controller
                    key={item.id}
                    name={`domains.${index}.value`}
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <div className="flex gap-2">
                          <Input
                            {...field}
                            placeholder="example.com"
                            autoComplete="off"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="not-hover:text-foreground hover:text-destructive"
                            onClick={() => domainsFieldArray.remove(index)}
                            disabled={domainsFieldArray.fields.length === 1}
                          >
                            <XIcon />
                          </Button>
                        </div>
                        <Activity
                          mode={fieldState.error ? "visible" : "hidden"}
                        >
                          <FieldError errors={[fieldState.error]} />
                        </Activity>
                      </Field>
                    )}
                  />
                ))}
              </FieldGroup>
              <Button
                variant="secondary"
                size="sm"
                className="h-8"
                onClick={() => domainsFieldArray.append({ value: "" })}
              >
                {t("config.addDomain")}
              </Button>
            </FieldSet>

            {/* Fields */}
            <FieldSet>
              <FieldLegend className="text-sm!">
                {t("field.configFields")}
              </FieldLegend>
              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={fieldsFieldArray.fields.map((field) => field.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <FieldGroup className="gap-3">
                    {fieldsFieldArray.fields.map((item, index) => (
                      <SortableFieldItem
                        key={item.id}
                        id={item.id}
                        index={index}
                        field={item}
                        control={form.control}
                        onEdit={handleEditField}
                        onDelete={handleDeleteField}
                      />
                    ))}
                  </FieldGroup>
                </SortableContext>
              </DndContext>
              <Activity
                mode={form.formState.errors.fields ? "visible" : "hidden"}
              >
                <FieldError errors={[form.formState.errors.fields]} />
              </Activity>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-8 w-full"
                onClick={addFieldDialog.open}
              >
                {t("field.addField")}
              </Button>
            </FieldSet>
          </div>
        </FieldGroup>
      </form>

      <FieldSheetForm
        formId="add-field-sheet-form"
        control={addFieldDialog}
        onSubmit={handleAddField}
      />
    </div>
  );
};
