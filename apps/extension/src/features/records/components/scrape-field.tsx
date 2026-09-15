import { CheckIcon, CopyIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { BadgeOverflow } from "@/components/ui/badge-overflow";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import type { ConfigField } from "@/lib/dexie";
import { isArrayField } from "@/utils/config-field";

interface ScrapeFieldProps {
  field: ConfigField;
  value?: string | string[];
}

export default function ScrapeField({ field, value }: ScrapeFieldProps) {
  const copyField = useCopyToClipboard();
  const isArray = isArrayField(field);
  const items = isArray ? (value as string[]) || [] : [];

  return (
    <Field orientation="horizontal">
      <FieldLabel htmlFor={field.name}>{field.name}</FieldLabel>
      <InputGroup className="max-w-[70%]">
        {isArray ? (
          <BadgeOverflow
            className="min-w-0 flex-1 px-3"
            items={items}
            renderBadge={(_, label) => <Badge variant="outline">{label}</Badge>}
          />
        ) : (
          <InputGroupInput value={value as string} readOnly />
        )}
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            aria-label="Copy"
            title="Copy"
            size="icon-xs"
            onClick={() => {
              copyField.copy(
                isArray ? items.join(", ") : (value as string) || "",
              );
            }}
          >
            {copyField.isCopied ? <CheckIcon /> : <CopyIcon />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  );
}
