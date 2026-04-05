import { closestCenter, DndContext, type DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { zodResolver } from "@hookform/resolvers/zod";
import { XIcon } from "lucide-react";
import { Activity, useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

import DialogWrapper, {
  type DialogWrapperProps,
} from "@/components/dialog-wrapper";
import { FormInput, FormSwitch } from "@/components/form";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ScrapeConfigsDialogFormFooter } from "@/features/configs/components/scrape-configs-dialog-form-footer";
import { ConfigSchema as configSchema } from "@/features/configs/schemas";
import type { ConfigInput } from "@/features/configs/types/form-input";
import ConfigFieldsSheetForm from "@/features/fields/components/config-fields-sheet-form";
import {
  useAddField,
  useDeleteField,
  useEditField,
} from "@/features/fields/hooks";
import type { FieldInput } from "@/features/fields/types/form-input";
import { useDialog } from "@/hooks/use-dialog";
import type { ConfigField, ScrapeConfig } from "@/lib/dexie";
import { logger } from "@/utils/logger";
import { toastError } from "@/utils/toast";
import SortableFieldItem from "./sortable-field-item";

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

type Props = Omit<DialogWrapperProps, "title"> & {
  id: string;
  configId?: ScrapeConfig["id"];
  config?: ConfigInput;
  onSubmit?: (input: ConfigInput) => Promise<void> | void;
};

export default function ScrapeConfigsDialogForm({
  id,
  configId,
  config,
  onSubmit,
  ...props
}: Props) {
  const addFieldDialog = useDialog();

  const { mutateAsync: addField } = useAddField();
  const { mutateAsync: editField } = useEditField();
  const { mutateAsync: deleteField } = useDeleteField();

  const form = useForm<ConfigInput>({
    resolver: zodResolver(configSchema),
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

  useEffect(() => {
    if (config) form.reset(config);
  }, [config, form]);

  async function handleSubmit(input: ConfigInput) {
    logger.log("Submitting form with input:", input);

    await onSubmit?.(input);
    if (!configId) form.reset();
    else form.reset(input);
  }

  async function handleAddField(data: FieldInput) {
    let toAdd = {
      ...data,
      order: fieldsFieldArray.fields.length,
    };

    logger.log("Adding field with data:", {
      data,
      toAdd,
    });

    if (!configId) {
      fieldsFieldArray.append(toAdd);
      addFieldDialog.close();
      return;
    }

    await addField(
      { ...toAdd, configId },
      {
        onSuccess: (newFieldId) => {
          toAdd = { ...toAdd, fieldId: newFieldId };

          fieldsFieldArray.append(toAdd);
          addFieldDialog.close();
          toast.success("Field added successfully");
          logger.log("Added field with id:", {
            newFieldId,
            toAdd,
          });
        },
        onError: (error) => toastError(error, "Failed to add field"),
      },
    );
  }

  async function handleEditField(
    index: number,
    data: FieldInput,
    id?: ConfigField["id"],
  ) {
    logger.log("Editing field with data:", {
      index,
      data,
      id,
    });

    if (!configId || !id) {
      form.setValue(`fields.${index}`, data);
      return;
    }

    await editField(
      { id, data: { ...data, configId } },
      {
        onSuccess: () => {
          form.setValue(`fields.${index}`, data);
          toast.success("Field updated successfully");
          logger.log("Updated field with id:", id);
        },
        onError: (error) => toastError(error, "Failed to update field"),
      },
    );
  }

  async function handleDeleteField(index: number, id?: ConfigField["id"]) {
    if (!configId || !id) {
      fieldsFieldArray.remove(index);
      return;
    }

    await deleteField(id, {
      onSuccess: () => {
        fieldsFieldArray.remove(index);
        toast.success("Field deleted successfully");
        logger.log("Deleted field with id:", id);
      },
      onError: (error) => toastError(error, "Failed to delete field"),
    });
  }

  function handleDragEnd(event: DragEndEvent) {
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
  }

  return (
    <DialogWrapper
      title={config ? "Edit Config" : "Add Config"}
      footer={
        <ScrapeConfigsDialogFormFooter
          id={id}
          mode={configId ? "edit" : "add"}
          form={form}
        />
      }
      {...props}
    >
      <form id={id} onSubmit={form.handleSubmit(handleSubmit)}>
        <FieldGroup>
          <FormInput
            control={form.control}
            name="name"
            label="Config Name"
            inputProps={{
              placeholder: "Enter config name",
              autoComplete: "off",
            }}
          />

          <FieldSet>
            <FieldLegend className="text-sm!">Config domains</FieldLegend>
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
                      <Activity mode={fieldState.error ? "visible" : "hidden"}>
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
              Add Domain
            </Button>
          </FieldSet>

          <FieldSet>
            <FieldLegend className="text-sm!">Config Fields</FieldLegend>
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
              Add Field
            </Button>
          </FieldSet>
          <FormSwitch control={form.control} name="isActive" label="Active" />
        </FieldGroup>
      </form>
      <ConfigFieldsSheetForm
        formId="add-field-sheet-form"
        open={addFieldDialog.isOpen}
        onOpenChange={addFieldDialog.onChange}
        onSubmit={handleAddField}
      />
    </DialogWrapper>
  );
}
