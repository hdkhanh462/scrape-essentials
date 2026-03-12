import type { UseFormReturn } from "react-hook-form";
import type {
  FieldInput,
  FullErrors,
} from "@/features/config-fields/types/form-input";

export type FieldTypePropsV2 = {
  form: UseFormReturn<FieldInput>;
  fullErrors?: FullErrors;
};
