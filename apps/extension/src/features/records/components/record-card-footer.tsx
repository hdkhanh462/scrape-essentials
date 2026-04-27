import { CheckIcon, CopyIcon, SaveIcon, Trash2Icon } from "lucide-react";
import { useTranslation } from "react-i18next";
import Loader from "@/components/loader";
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

export function RecordCardFooter({
  id,
  matchConfig,
  rawScrapedData,
  scrapedRecord,
  rawKey,
  isDirty,
  onDeleteSuccess,
}: FooterProps) {
  const { t } = useTranslation();

  const copyScrapedData = useCopyToClipboard();
  const { mutate: deleteRecord } = useDeleteRecord();

  const handleDelete = async () => {
    if (!scrapedRecord) return;

    deleteRecord(scrapedRecord.id, {
      onSuccess: () => {
        onDeleteSuccess?.();
      },
      onError: (error) => toastError(error, t("message.failedToDeleteRecord")),
    });
  };

  const handleCopy = () => {
    logger.log("Copying data with", {
      matchConfig,
      rawScrapedData,
      scrapedRecord,
      rawKey,
    });

    if (!matchConfig || !rawScrapedData) {
      logger.error("Missing matchConfig or rawScrapedData, cannot copy");
      return;
    }

    const copyData = processCopyData({
      matchConfig,
      scrapedData: rawScrapedData,
      scrapedRecord,
      key: rawKey,
    });

    logger.log("Processed copy data", { copyData });

    copyScrapedData.copy(copyData);
  };

  return (
    <Field orientation="horizontal">
      {scrapedRecord && (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="h-8"
          disabled={!scrapedRecord}
          onClick={handleDelete}
        >
          <Trash2Icon />
          {t("button.delete")}
        </Button>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8"
        disabled={!matchConfig || !rawScrapedData}
        onClick={handleCopy}
      >
        <Loader
          isLoading={copyScrapedData.isCopied}
          fallback={
            <>
              <CheckIcon />
              {t("button.copied")}
            </>
          }
        >
          <CopyIcon />
          {t("button.copy")}
        </Loader>
      </Button>
      <Button
        type="submit"
        size="sm"
        className="h-8"
        form={id}
        disabled={!isDirty && !!scrapedRecord}
      >
        <SaveIcon />
        {t("button.save")}
      </Button>
    </Field>
  );
}
