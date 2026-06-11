import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVerticalIcon, MoreHorizontalIcon } from "lucide-react";
import { type Control, Controller, type FieldPath } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import type { ConfigInput } from "@/features/configs/types/form-input";
import { FieldSheetForm } from "@/features/fields/components/field-sheet-form";
import type { FieldInput } from "@/features/fields/types/form-input";
import { useDialog } from "@/hooks/use-dialog";
import type { ConfigField } from "@/lib/dexie";
import { isTextField } from "@/utils/config-field";

interface SortableFieldItemProps {
  id: string;
  index: number;
  field: FieldInput;
  control: Control<ConfigInput>;
  onEdit: (
    index: number,
    data: FieldInput,
    id?: ConfigField["id"],
  ) => Promise<void>;
  onDelete: (index: number, id?: ConfigField["id"]) => void;
}

export default function SortableFieldItem({
  id,
  index,
  field,
  control,
  onEdit,
  onDelete,
}: SortableFieldItemProps) {
  const { t } = useTranslation();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const editFieldDialog = useDialog();
  const deleteConfirmDialog = useDialog();

  const fieldName = `fields.${index}.name` as const;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={isDragging ? "z-50 opacity-60" : ""}
    >
      <Controller
        name={fieldName as FieldPath<ConfigInput>}
        control={control}
        render={({ field: controllerField, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <InputGroupButton
                  variant="ghost"
                  size="icon-xs"
                  {...attributes}
                  {...listeners}
                  aria-label="Drag to reorder field"
                  className="cursor-grab active:cursor-grabbing"
                >
                  <GripVerticalIcon />
                </InputGroupButton>
              </InputGroupAddon>
              <InputGroupInput value={controllerField.value} readOnly />
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
                    <DropdownMenuItem onSelect={editFieldDialog.open}>
                      {t("button.edit")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={deleteConfirmDialog.open}
                      disabled={isTextField(field) && field.isPrimary}
                    >
                      {t("button.delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </InputGroupAddon>
            </InputGroup>
          </Field>
        )}
      />

      <FieldSheetForm
        control={editFieldDialog}
        formId={`edit-field-sheet-form-${id}`}
        field={field}
        onSubmit={async (data) => await onEdit(index, data, field.fieldId)}
      />
      <ConfirmDialog
        control={deleteConfirmDialog}
        title={t("dialog.areYouSure")}
        description={t("dialog.deleteFieldConfirmation")}
        onConfirm={() => onDelete(index, field.fieldId)}
      />
    </div>
  );
}
