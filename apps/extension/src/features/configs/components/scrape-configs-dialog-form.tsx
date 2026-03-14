import { zodResolver } from "@hookform/resolvers/zod";
import { MoreHorizontalIcon, XIcon } from "lucide-react";
import { Dialog } from "radix-ui";
import { Activity, useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

import DialogWrapper, {
  type DialogWrapperProps,
} from "@/components/dialog-wrapper";
import { FormInput, FormSwitch } from "@/components/form";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
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
    await onSubmit?.(input);
    if (!configId) form.reset();
    else form.reset(input);
  }

  async function handleAddField(data: FieldInput) {
    let toAdd = {
      ...data,
      order: fieldsFieldArray.fields.length,
    };
    if (!configId) return;

    await addField(
      {
        ...toAdd,
        configId,
      },
      {
        onSuccess: (newFieldId) => {
          toAdd = {
            ...toAdd,
            fieldId: newFieldId,
          };

          toast.success("Field added successfully");
          fieldsFieldArray.append(toAdd);
          addFieldDialog.close();
        },
        onError: (error) => {
          console.error("Error adding field:", error);
          toast.error("Field add failed", {
            description: error.message,
          });
        },
      },
    );
  }

  async function handleEditField(
    index: number,
    data: FieldInput,
    id?: ConfigField["id"],
  ) {
    if (!configId || !id) return;

    await editField(
      {
        id,
        data: {
          ...data,
          configId,
        },
      },
      {
        onSuccess: () => {
          form.setValue(`fields.${index}`, data);
          toast.success("Field updated successfully");
        },
        onError: (error) => {
          console.error("Error editing field:", error);
          toast.error("Field update failed", {
            description: error.message,
          });
        },
      },
    );
  }

  async function handleDeleteField(index: number, id?: ConfigField["id"]) {
    if (!configId || !id) return;

    await deleteField(id, {
      onSuccess: () => {
        fieldsFieldArray.remove(index);
        toast.success("Field deleted successfully");
      },
      onError: (error) => {
        console.error("Error deleting field:", error);
        toast.error("Field delete failed", {
          description: error.message,
        });
      },
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
              onClick={() => domainsFieldArray.append({ value: "" })}
            >
              Add Domain
            </Button>
          </FieldSet>

          <FieldSet>
            <FieldLegend className="text-sm!">Config Fields</FieldLegend>
            <FieldGroup className="gap-3">
              {fieldsFieldArray.fields.map((item, index) => (
                <Controller
                  key={item.id}
                  name={`fields.${index}.name`}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <InputGroup>
                        <InputGroupInput value={field.value} readOnly />
                        <InputGroupAddon align="inline-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <InputGroupButton
                                variant="ghost"
                                aria-label="More"
                                size="icon-xs"
                              >
                                <MoreHorizontalIcon />
                              </InputGroupButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <ConfigFieldsSheetForm
                                formId="edit-field-sheet-form"
                                field={form.getValues(`fields.${index}`)}
                                onSubmit={(data) =>
                                  handleEditField(index, data, item.fieldId)
                                }
                                trigger={
                                  <Dialog.Trigger
                                    className="w-full"
                                    type="button"
                                  >
                                    <DropdownMenuItem
                                      onSelect={(e) => e.preventDefault()}
                                    >
                                      Edit
                                    </DropdownMenuItem>
                                  </Dialog.Trigger>
                                }
                              />

                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() =>
                                  handleDeleteField(index, item.fieldId)
                                }
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </InputGroupAddon>
                      </InputGroup>
                    </Field>
                  )}
                />
              ))}
              <Activity
                mode={form.formState.errors.fields ? "visible" : "hidden"}
              >
                <FieldError errors={[form.formState.errors.fields]} />
              </Activity>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={addFieldDialog.open}
              >
                Add Field
              </Button>
            </FieldGroup>
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
