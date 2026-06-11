import type { PropsWithChildren } from "react";
import {
  FormBase,
  type FormControlFunc,
  type FormInputProps,
  type FormSelectProps,
} from "@/components/form";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select";
import { NumberInput } from "@/components/ui/number-input";
import { PasswordInput } from "@/components/ui/password-input";
import {
  TagsInput,
  TagsInputInput,
  TagsInputItem,
  TagsInputList,
} from "@/components/ui/tags-input";

export const FormPasswordInput: FormControlFunc<FormInputProps> = (props) => {
  return (
    <FormBase {...props}>
      {(field, props) => <PasswordInput {...field} {...props} />}
    </FormBase>
  );
};

export const FormNumberInput: FormControlFunc<FormInputProps> = (props) => {
  return (
    <FormBase {...props}>
      {(field, inputProps) => <NumberInput {...field} {...inputProps} />}
    </FormBase>
  );
};

type FormTagsInputProps = PropsWithChildren<{
  editable?: boolean;
  addOnPaste?: boolean;
  placeholder?: string;
}>;

export const FormTagsInput: FormControlFunc<FormTagsInputProps> = (props) => {
  return (
    <FormBase {...props}>
      {(field, inputProps) => (
        <TagsInput
          value={field.value || []}
          onValueChange={field.onChange}
          editable={inputProps?.editable}
          addOnPaste={inputProps?.addOnPaste}
        >
          <TagsInputList>
            {Array.isArray(field.value) &&
              field.value.map((value: string) => (
                <TagsInputItem key={value} value={value}>
                  {value}
                </TagsInputItem>
              ))}
            <TagsInputInput placeholder={inputProps?.placeholder} />
          </TagsInputList>
        </TagsInput>
      )}
    </FormBase>
  );
};

export const FormSelectMultiple: FormControlFunc<FormSelectProps> = (props) => {
  return (
    <FormBase {...props}>
      {({ onChange, onBlur, ...field }) => (
        <MultiSelect values={field.value} onValuesChange={onChange}>
          <MultiSelectTrigger
            aria-invalid={field["aria-invalid"]}
            id={field.id}
            onBlur={onBlur}
          >
            <MultiSelectValue placeholder={props.inputProps?.placeholder} />
          </MultiSelectTrigger>
          <MultiSelectContent>{props.inputProps?.children}</MultiSelectContent>
        </MultiSelect>
      )}
    </FormBase>
  );
};
