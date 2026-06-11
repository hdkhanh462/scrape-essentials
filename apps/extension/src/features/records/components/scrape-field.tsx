import { CheckIcon, CopyIcon } from "lucide-react";

import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import type { ConfigField } from "@/lib/dexie";

interface ScrapeFieldProps {
  field: ConfigField;
  value?: string;
}

export default function ScrapeField({ field, value }: ScrapeFieldProps) {
  const copyField = useCopyToClipboard();

  return (
    <Field orientation="horizontal">
      <FieldLabel htmlFor={field.name}>{field.name}</FieldLabel>
      <InputGroup className="max-w-[70%]">
        <InputGroupInput value={value} readOnly />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            aria-label="Copy"
            title="Copy"
            size="icon-xs"
            onClick={() => {
              copyField.copy(value || "");
            }}
          >
            {copyField.isCopied ? <CheckIcon /> : <CopyIcon />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  );
}
