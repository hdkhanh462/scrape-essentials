import type { Column, Table } from "@tanstack/react-table";
import {
  DownloadIcon,
  ExternalLinkIcon,
  FilterIcon,
  PlusCircle,
  UploadIcon,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { useGetFields } from "@/features/fields/hooks";
import { SearchHistory } from "@/features/records/components/search-history";
import {
  useGetRecordFieldValues,
  useImportRecords,
} from "@/features/records/hooks";
import { useRecordStore } from "@/features/records/stores/record.store";
import { isValidFilter } from "@/features/records/utils/filter";
import { useDialog } from "@/hooks/use-dialog";
import {
  type ConfigField,
  dexie,
  FieldType,
  type ScrapedRecord,
} from "@/lib/dexie";
import {
  EMPTY_FILTER_VALUE,
  isArrayField,
  isFacetFilterField,
} from "@/utils/config-field";
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

  const openUrlsConfirmDialog = useDialog();

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

  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const isSelected = selectedCount > 0;

  const fieldColumnIds = new Set(fields?.map((field) => field.name));
  const activeFieldFilterCount = table
    .getState()
    .columnFilters.filter((filter) => fieldColumnIds.has(filter.id)).length;

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

  const selectedUrls = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original.url)
    .filter((url): url is string => !!url);

  const handleOpenUrls = () => {
    if (selectedUrls.length === 0) {
      toast.error(t("message:noUrlToOpen"));
      return;
    }

    for (const url of selectedUrls) {
      browser.tabs.create({ url, active: false });
    }
    openUrlsConfirmDialog.close();
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

        {!!fields?.length && (
          <Sheet open={filterDrawerOpen} onOpenChange={setFilterDrawerOpen}>
            <SheetTrigger
              render={
                <Button variant="outline" size="sm" className="h-8">
                  <FilterIcon className="size-3.5" />
                  {t("button:filter")}
                  {activeFieldFilterCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="rounded-sm px-1 font-normal"
                    >
                      {activeFieldFilterCount}
                    </Badge>
                  )}
                </Button>
              }
            />
            <SheetContent className="w-80" showCloseButton={false}>
              <SheetHeader className="flex-row items-center justify-between">
                <SheetTitle className="leading-none">
                  {t("button:filter")}
                </SheetTitle>
                <div className="flex items-center gap-1">
                  {activeFieldFilterCount > 0 && (
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => {
                        for (const field of fields) {
                          table
                            .getColumn(field.name)
                            ?.setFilterValue(undefined);
                        }
                      }}
                    >
                      {t("button:clearFilters")}
                    </Button>
                  )}
                  <SheetClose
                    render={<Button variant="ghost" size="icon-xs" />}
                  >
                    <XIcon />
                    <span className="sr-only">Close</span>
                  </SheetClose>
                </div>
              </SheetHeader>
              <div className="flex flex-col gap-2 overflow-y-auto px-4 pb-4">
                {fields.map((field) =>
                  field.type === FieldType.InputNumber ? (
                    <RecordNumberRangeFilter
                      key={field.id}
                      table={table}
                      field={field}
                    />
                  ) : isFacetFilterField(field) ? (
                    <RecordArrayFacetedFilter
                      key={field.id}
                      table={table}
                      configId={configId}
                      field={field}
                      triggerClassName="w-full justify-start border-solid"
                    />
                  ) : (
                    <DataTableFacetedFilter
                      key={field.id}
                      // biome-ignore lint/suspicious/noExplicitAny: <>
                      column={table.getColumn(field.name) as any}
                      title={field.name}
                      options={[
                        {
                          value: EMPTY_FILTER_VALUE,
                          label: EMPTY_FILTER_VALUE,
                        },
                        ...(field.uiOptions?.options?.map((option) => ({
                          value: option.value,
                          label: option.label,
                        })) || []),
                      ]}
                      triggerClassName="w-full justify-start border-solid"
                    />
                  ),
                )}
              </div>
            </SheetContent>
          </Sheet>
        )}

        {isSelected && (
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={openUrlsConfirmDialog.open}
          >
            <ExternalLinkIcon />
            {t("record:openUrls")} ({selectedUrls.length})
          </Button>
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

        <ConfirmDialog
          control={openUrlsConfirmDialog}
          title={t("dialog:areYouSure")}
          description={t("record:openUrlsConfirmation", {
            count: selectedUrls.length,
          })}
          onConfirm={handleOpenUrls}
        />
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

interface RecordNumberRangeFilterProps {
  table: Table<ScrapedRecord>;
  field: ConfigField;
}

function RecordNumberRangeFilter({
  table,
  field,
}: RecordNumberRangeFilterProps) {
  const column = table.getColumn(field.name);
  const applied = column?.getFilterValue() as [number, number] | undefined;

  const numbers = table
    .getCoreRowModel()
    .rows.map((row) => row.original.data[field.name])
    .filter((v) => v !== undefined && v !== null && v !== "")
    .map(Number)
    .filter(Number.isFinite);
  const min = numbers.length ? Math.min(...numbers) : 0;
  const max = numbers.length ? Math.max(...numbers) : 0;
  const step = numbers.every(Number.isInteger) ? 1 : 0.01;

  const [draft, setDraft] = useState<number[] | null>(null);
  const current = draft ?? applied ?? [min, max];

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-full justify-start border-solid"
          >
            <PlusCircle />
            {field.name}
            {applied && (
              <>
                <Separator orientation="vertical" className="mx-2 h-4" />
                <Badge
                  variant="secondary"
                  className="rounded-sm px-1 font-normal"
                >
                  {applied[0]} – {applied[1]}
                </Badge>
              </>
            )}
          </Button>
        }
      />
      <PopoverContent className="w-64 gap-3" align="start">
        {min === max ? (
          <span className="text-muted-foreground text-sm">
            {numbers.length ? min : "-"}
          </span>
        ) : (
          <>
            <Slider
              min={min}
              max={max}
              step={step}
              value={current}
              onValueChange={(v) => setDraft(v as number[])}
              onValueCommitted={(v) => {
                const [lo, hi] = v as number[];
                setDraft(null);
                column?.setFilterValue(
                  lo === min && hi === max ? undefined : [lo, hi],
                );
              }}
            />
            <div className="flex justify-between font-mono text-xs">
              <span>{current[0]}</span>
              <span>{current[1]}</span>
            </div>
          </>
        )}
        {applied && (
          <Button
            variant="ghost"
            size="xs"
            onClick={() => column?.setFilterValue(undefined)}
          >
            Clear filters
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}

interface RecordArrayFacetedFilterProps {
  table: Table<ScrapedRecord>;
  configId: ScrapedRecord["configId"] | undefined;
  field: ConfigField;
  triggerClassName?: string;
}

function RecordArrayFacetedFilter({
  table,
  configId,
  field,
  triggerClassName,
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
      options={[
        { value: EMPTY_FILTER_VALUE, label: EMPTY_FILTER_VALUE },
        ...(values ?? []).map((value) => ({
          value,
          label: value,
        })),
      ]}
      triggerClassName={triggerClassName}
    />
  );
}
