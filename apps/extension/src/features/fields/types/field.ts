import type { UseFormReturn } from "react-hook-form";
import type {
  FieldInput,
  FullErrors,
} from "@/features/fields/types/form-input";

export type FieldTypePropsV2 = {
  form: UseFormReturn<FieldInput>;
  fullErrors?: FullErrors;
};
