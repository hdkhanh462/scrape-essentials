import { zodResolver } from "@hookform/resolvers/zod";
import { Activity } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import CardWrapper from "@/components/card-wrapper";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FieldGroup } from "@/components/ui/field";
import ScrapeField from "@/features/scraped-records/components/scrape-field";
import { ScrapedRecordsCardFooter } from "@/features/scraped-records/components/scraped-records-card-footer";
import UiField from "@/features/scraped-records/components/ui-field";
import { recordApi } from "@/features/scraped-records/data/record.api";
import type { ScrapedDataInput } from "@/features/scraped-records/types/form-input";
import type { MatchConfig } from "@/features/scraped-records/types/scrape";
import {
  buildDefaultScrapedData,
  buildScrapedDataSchema,
} from "@/features/scraped-records/utils/helpers";
import { type ConfigField, FieldType } from "@/lib/dexie";
import { cn } from "@/lib/utils";
import { isLargeField } from "@/utils/config-field";

interface Props {
  fields: ConfigField[];
  matchConfig: MatchConfig;
  rawScrapedData: ScrapedDataInput;
}

export function ScrapedRecordsCard({
  fields,
  matchConfig,
  rawScrapedData,
}: Props) {
  const [rawKey, setRawKey] = useState<string>();
  const [addScrapedRecord] = recordApi.useAddScrapedRecordMutation({});
  const [editScrapedRecord] = recordApi.useEditScrapedRecordMutation({});
  const { data: scrapedRecord } = recordApi.useGetScrapedRecordQuery({
    id: matchConfig?.config.id,
    key: rawKey,
  });

  const schema = useMemo(() => buildScrapedDataSchema(fields), [fields]);
  const defaultValues = useMemo(
    () => buildDefaultScrapedData(fields),
    [fields],
  );

  const form = useForm<ScrapedDataInput>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    if (rawScrapedData) {
      const _rawKey =
        rawScrapedData[fields.find((field) => field.isPrimary)?.name || ""];
      setRawKey(_rawKey as string);
    }
  }, [rawScrapedData]);

  useEffect(() => {
    if (scrapedRecord) {
      const merged: ScrapedDataInput = {};

      fields.forEach((field) => {
        const isValid =
          (isInputFieldType(field.type) || isSelectFieldType(field.type)) &&
          !field.isParent &&
          scrapedRecord.data[field.name] !== undefined;

        if (isValid) merged[field.name] = scrapedRecord.data[field.name];
      });

      const { data: parsed, error } = schema.safeParse({
        ...form.getValues(),
        ...merged,
      });

      if (error) {
        console.error("Error parsing scraped record data:", error);
        return;
      }

      form.reset(parsed);
    }
  }, [scrapedRecord, form, schema, fields]);

  const addRecord = async (key: string, data: Record<string, unknown>) => {
    const { error } = await addScrapedRecord({
      id: matchConfig.config.id,
      data: {
        configId: matchConfig.config.id,
        key,
        data,
      },
    });

    if (error) {
      console.error("Error adding scraped record:", error);
      toast.error("Add record failed");
      return;
    }

    toast.success("Record added successfully");
  };

  const editRecord = async (id: string, data: Record<string, unknown>) => {
    const { error } = await editScrapedRecord({
      id,
      data: { data },
    });

    if (error) {
      console.error("Error editing scraped record:", error);
      toast.error("Edit record failed");
      return;
    }

    toast.success("Record edited successfully");
  };

  const handleSubmit = async (input: ScrapedDataInput) => {
    const merged = input;
    fields.forEach((field) => {
      if (
        field.isParent ||
        field.isPrimary ||
        !rawScrapedData ||
        isInputFieldType(field.type) ||
        isSelectFieldType(field.type)
      )
        return;
      merged[field.name] = rawScrapedData[field.name];
    });

    if (matchConfig && rawKey) {
      if (scrapedRecord) {
        await editRecord(scrapedRecord.id, merged);
        return;
      }

      await addRecord(rawKey, merged);
    }
  };

  return (
    <CardWrapper
      title={`Scrape Essentials - ${matchConfig.config.name}`}
      footer={
        <ScrapedRecordsCardFooter
          id="scrape-data-form"
          matchConfig={matchConfig}
          rawScrapedData={rawScrapedData}
          scrapedRecord={scrapedRecord}
          rawKey={rawKey}
          isDirty={form.formState.isDirty}
          onDeleteSuccess={() => form.reset(defaultValues)}
        />
      }
    >
      <form id="scrape-data-form" onSubmit={form.handleSubmit(handleSubmit)}>
        <FieldGroup>
          <Activity
            mode={
              fields.some(
                (field) =>
                  isInputFieldType(field.type) || isSelectFieldType(field.type),
              )
                ? "visible"
                : "hidden"
            }
          >
            <div className="grid grid-cols-2 gap-2">
              {fields.map((field, index) => {
                const isLarge =
                  isLargeField(field.type) ||
                  (index % 2 === 0 &&
                    !isLargeField(fields[index + 1]?.type) &&
                    fields[index + 1]?.type === FieldType.InputCheckbox) ||
                  (index % 2 === 0 &&
                    isScrapeFieldType(fields[index + 1]?.type));

                return (
                  (isInputFieldType(field.type) ||
                    isSelectFieldType(field.type)) &&
                  !field.isParent && (
                    <div key={field.id} className={cn(isLarge && "col-span-2")}>
                      <UiField field={field} control={form.control} />
                    </div>
                  )
                );
              })}
            </div>
          </Activity>
          <Activity>
            <Accordion type="single" defaultValue="item-1" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger className="py-0 data-[state=open]:pb-4!">
                  Scraped Data
                </AccordionTrigger>
                <AccordionContent className="space-y-2 pb-0">
                  {fields.map(
                    (field) =>
                      (field.type === FieldType.PageUrl ||
                        isScrapeFieldType(field.type)) &&
                      !field.isParent && (
                        <ScrapeField
                          key={field.id}
                          field={field}
                          value={rawScrapedData?.[field.name] as string}
                        />
                      ),
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Activity>
        </FieldGroup>
      </form>
    </CardWrapper>
  );
}
