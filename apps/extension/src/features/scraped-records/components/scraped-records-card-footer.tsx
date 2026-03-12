import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { recordApi } from "@/features/scraped-records/data/record.api";
import type { ScrapedDataInput } from "@/features/scraped-records/types/form-input";
import type { MatchConfig } from "@/features/scraped-records/types/scrape";
import { processCopyData } from "@/features/scraped-records/utils/copy";
import type { ScrapedRecord } from "@/lib/dexie";

interface FooterProps {
  id: string;
  matchConfig: MatchConfig | undefined;
  rawScrapedData: ScrapedDataInput | undefined;
  scrapedRecord?: ScrapedRecord;
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
  const [deleteScrapedRecord] = recordApi.useDeleteScrapedRecordMutation();

  return (
    <Field orientation="horizontal">
      {scrapedRecord && (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={!scrapedRecord}
          onClick={async () => {
            if (scrapedRecord) {
              await deleteScrapedRecord(scrapedRecord.id);
              onDeleteSuccess?.();
            }
          }}
        >
          Delete
        </Button>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!matchConfig || !rawScrapedData}
        onClick={() => {
          if (matchConfig && rawScrapedData) {
            const copyData = processCopyData({
              matchConfig,
              scrapedData: rawScrapedData,
              scrapedRecord,
              key: rawKey,
            });
            copyToClipboard(copyData);
          }
        }}
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
