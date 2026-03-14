import { TriangleAlertIcon } from "lucide-react";
import { useEffect, useState } from "react";

import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useGetConfigs } from "@/features/configs/hooks";
import { useGetFields } from "@/features/fields/hooks";
import { ScrapedRecordsCard } from "@/features/records/components/scraped-records-card";
import { useGetCurrentPage } from "@/features/records/hooks";
import type { ScrapedDataInput } from "@/features/records/types/form-input";
import type { MatchConfig } from "@/features/records/types/scrape";
import { processField } from "@/features/records/utils/processor";

export default function App() {
  const [matchConfig, setMatchConfig] = useState<MatchConfig>();
  const [rawScrapedData, setRawScrapedData] = useState<ScrapedDataInput>();

  const { data: currentPage, isFetching: isCurrentPageLoading } =
    useGetCurrentPage();
  const { data: configs, isFetching: isConfigsLoading } = useGetConfigs({
    isActive: true,
  });

  const { data: fields, isFetching: isFieldsLoading } = useGetFields({
    configId: matchConfig?.config?.id,
  });

  useEffect(() => {
    if (!currentPage || !configs || !fields) return;

    const { hostname } = new URL(currentPage.url);
    const _matchConfig = configs.find((config) =>
      config.domains.some((domain) => new RegExp(domain).test(hostname)),
    );

    if (_matchConfig && fields) {
      setMatchConfig({
        config: _matchConfig,
        fields,
      });
    }
  }, [currentPage, configs, fields]);

  useEffect(() => {
    if (!currentPage || !matchConfig) return;

    (async () => {
      const result: ScrapedDataInput = {};

      for (const field of matchConfig.fields) {
        try {
          result[field.name] = await processField(currentPage, field);
        } catch (error) {
          console.error(`Error processing field "${field.name}":`, error);
        }
      }

      setRawScrapedData(result);
    })();
  }, [currentPage, matchConfig]);

  const title = useMemo(() => {
    if (!matchConfig) {
      return "No matching config found";
    }
    if (!fields || fields.length === 0) {
      return "No fields configured";
    }
    return "No data scraped";
  }, [matchConfig, fields]);

  if (isCurrentPageLoading || isConfigsLoading || isFieldsLoading) {
    return null;
  }

  if (
    !fields ||
    fields.length === 0 ||
    !matchConfig ||
    !rawScrapedData ||
    Object.keys(rawScrapedData).length === 0
  ) {
    return (
      <div className="min-w-md space-y-4">
        <Empty className="max-h-35.5 p-8">
          <EmptyHeader>
            <EmptyMedia
              variant="icon"
              className="size-11.5 rounded-full border"
            >
              <TriangleAlertIcon className="size-6 text-primary" />
            </EmptyMedia>
            <EmptyTitle>{title}</EmptyTitle>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <div className="min-w-md space-y-4">
      <ScrapedRecordsCard
        fields={matchConfig.fields}
        matchConfig={matchConfig}
        rawScrapedData={rawScrapedData}
      />
    </div>
  );
}
