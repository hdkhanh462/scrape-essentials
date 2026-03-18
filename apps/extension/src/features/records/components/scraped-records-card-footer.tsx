import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { useDeleteRecord } from "@/features/records/hooks";
import type { ScrapedDataInput } from "@/features/records/types/form-input";
import type { MatchConfig } from "@/features/records/types/scrape";
import { processCopyData } from "@/features/records/utils/copy";
import type { ScrapedRecord } from "@/lib/dexie";
import { toastError } from "@/utils/toast";

interface FooterProps {
  id: string;
  matchConfig: MatchConfig | undefined;
  rawScrapedData: ScrapedDataInput | undefined;
  scrapedRecord?: ScrapedRecord | null;
  rawKey?: string;
  isDirty?: boolean;
  onDeleteSuccess?: () => void;
}

export function ScrapedRecordsCardFooter({
  id,
  matchConfig,
  rawScrapedData,
  scrapedRecord,
  rawKey,
  isDirty,
  onDeleteSuccess,
}: FooterProps) {
  const { copyToClipboard } = useCopyToClipboard();
  const { mutate: deleteRecord } = useDeleteRecord();

  const handleDelete = async () => {
    if (!scrapedRecord) return;

    deleteRecord(scrapedRecord.id, {
      onSuccess: () => {
        onDeleteSuccess?.();
      },
      onError: (error) => toastError(error, "Delete record failed"),
    });
  };

  const handleCopy = () => {
    if (!matchConfig || rawScrapedData) return;

    const copyData = processCopyData({
      matchConfig,
      scrapedData: rawScrapedData,
      scrapedRecord,
      key: rawKey,
    });
    copyToClipboard(copyData);
  };

  return (
    <Field orientation="horizontal">
      {scrapedRecord && (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={!scrapedRecord}
          onClick={handleDelete}
        >
          Delete
        </Button>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!matchConfig || !rawScrapedData}
        onClick={handleCopy}
      >
        Copy
      </Button>
      <Button
        type="submit"
        size="sm"
        form={id}
        disabled={!isDirty && !!scrapedRecord}
      >
        Save
      </Button>
    </Field>
  );
}
