import type { Column, Table } from "@tanstack/react-table";
import { DownloadIcon, UploadIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Button } from "@/components/ui/button";
import { useGetFields } from "@/features/fields/hooks";
import { SearchHistory } from "@/features/records/components/search-history";
import {
  useGetRecordFieldValues,
  useImportRecords,
} from "@/features/records/hooks";
import { useRecordStore } from "@/features/records/stores/record.store";
import { isValidFilter } from "@/features/records/utils/filter";
import { useDialog } from "@/hooks/use-dialog";
import { type ConfigField, dexie, type ScrapedRecord } from "@/lib/dexie";
import { isArrayField } from "@/utils/config-field";
import { exportBlob, importFromJSON } from "@/utils/import-export";
import { logger } from "@/utils/logger";
import { toastError } from "@/utils/toast";

interface DataTableToolbarProps {
  table: Table<ScrapedRecord>;
  onDeleteSelected?: (ids: ScrapedRecord["id"][]) => void;
}

export function RecordTableToolbar({
  table,
  onDeleteSelected,
}: DataTableToolbarProps) {
  const { t } = useTranslation();

  const { configId, filterString } = useRecordStore();
  const { setFilterString } = useRecordStore((state) => state.actions);

  const [importPayload, setImportPayload] = useState<ScrapedRecord[]>();
  const [filterValue, setFilterValue] = useState(filterString);

  const importConfirmDialog = useDialog();
  const { mutate: importRecords } = useImportRecords();

  const { data: fields } = useGetFields({
    configId,
    isShowOnTable: true,
    isFilterable: true,
  });

  logger.debug(
    "[RecordTableToolbar] filterable fields",
    fields?.map((field) => ({
      name: field.name,
      type: field.type,
      isFilterable: field.isFilterable,
      isArrayField: isArrayField(field),
    })),
  );

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const isSelected = selectedCount > 0;

  const handleExport = async () => {
    const records = await dexie.scrapedRecords.toArray();
    const blob = new Blob([JSON.stringify(records)], {
      type: "application/json",
    });
    await exportBlob({
      blob,
      prefix: "records-export",
    });
    toast.success(t("message:exportSuccessful"));
  };

  const handleImportClick = async () => {
    await importFromJSON(async (file) => {
      const text = await file.text();
      const data = JSON.parse(text);
      setImportPayload(data);
      importConfirmDialog.open();
    });
  };

  const handleImportConfirm = async () => {
    if (!importPayload) return;

    importRecords(importPayload, {
      onSuccess: () => {
        toast.success(t("message:configsImportedSuccessfully"));
        importConfirmDialog.close();
      },
      onError: (error) => toastError(error, t("message:failedToImportConfigs")),
    });
  };

  const handleValidateSearch = (value: string) => {
    if (value !== "" && !isValidFilter(value)) {
      toast.error("Invalid filter syntax. Please check your input");
      return false;
    }
    return true;
  };

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex flex-1 items-center gap-2">
        <SearchHistory
          placeholder={`Name:"john Doe" & Age>=18 | Name:jane & Age<25`}
          value={filterValue}
          onChange={setFilterValue}
          onValidate={handleValidateSearch}
          onSearch={setFilterString}
        />

        {fields?.map((field) =>
          isArrayField(field) ? (
            <RecordArrayFacetedFilter
              key={field.id}
              table={table}
              configId={configId}
              field={field}
            />
          ) : (
            <DataTableFacetedFilter
              key={field.id}
              // biome-ignore lint/suspicious/noExplicitAny: <>
              column={table.getColumn(field.name) as any}
              title={field.name}
              options={
                field.uiOptions?.options?.map((option) => ({
                  value: option.value,
                  label: option.label,
                })) || []
              }
            />
          ),
        )}

        {isSelected && (
          <Button
            variant="destructive"
            size="sm"
            className="h-8"
            onClick={() => {
              const selectedIds = table
                .getFilteredSelectedRowModel()
                .rows.map((row) => row.original.id);
              onDeleteSelected?.(selectedIds);
            }}
          >
            Delete ({selectedCount})
            <XIcon />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="h-8"
          onClick={handleImportClick}
        >
          <DownloadIcon />
          {t("button:import")}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8"
          onClick={handleExport}
        >
          <UploadIcon />
          {t("button:export")}
        </Button>
        <ConfirmDialog
          control={importConfirmDialog}
          title={t("dialog:areYouSure")}
          description={t("dialog:importRecordsConfirmation")}
          onConfirm={handleImportConfirm}
        />
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}

interface RecordArrayFacetedFilterProps {
  table: Table<ScrapedRecord>;
  configId: ScrapedRecord["configId"] | undefined;
  field: ConfigField;
}

function RecordArrayFacetedFilter({
  table,
  configId,
  field,
}: RecordArrayFacetedFilterProps) {
  const { data: values } = useGetRecordFieldValues({
    configId,
    fieldName: field.name,
  });

  logger.debug("[RecordArrayFacetedFilter]", field.name, {
    configId,
    column: !!table.getColumn(field.name),
    values,
  });

  return (
    <DataTableFacetedFilter
      column={
        table.getColumn(field.name) as Column<ScrapedRecord, string> | undefined
      }
      title={field.name}
      options={(values ?? []).map((value) => ({
        value,
        label: value,
      }))}
    />
  );
}
