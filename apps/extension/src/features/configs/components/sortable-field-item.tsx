import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVerticalIcon, MoreHorizontalIcon } from "lucide-react";
import { Dialog } from "radix-ui";
import { type Control, Controller, type FieldPath } from "react-hook-form";

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
import ConfigFieldsSheetForm from "@/features/fields/components/config-fields-sheet-form";
import type { FieldInput } from "@/features/fields/types/form-input";
import type { ConfigField } from "@/lib/dexie";

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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

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
                    <ConfigFieldsSheetForm
                      formId={`edit-field-sheet-form-${id}`}
                      field={field}
                      onSubmit={async (data) =>
                        await onEdit(index, data, field.fieldId)
                      }
                      trigger={
                        <Dialog.Trigger className="w-full" type="button">
                          <DropdownMenuItem
                            onSelect={(event) => event.preventDefault()}
                          >
                            Edit
                          </DropdownMenuItem>
                        </Dialog.Trigger>
                      }
                    />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => onDelete(index, field.fieldId)}
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
    </div>
  );
}
