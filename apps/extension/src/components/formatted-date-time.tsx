import { useSettingsStore } from "@/features/settings/stores/settings.store";
import { formatDateTime } from "@/utils/date";

interface Props {
  value: string | number | Date;
}

export function FormattedDateTime({ value }: Props) {
  const { dateFormat, timeFormat } = useSettingsStore();

  return <span>{formatDateTime(value, { dateFormat, timeFormat })}</span>;
}
