import { TriangleAlertIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useGetConfigs } from "@/features/configs/hooks";
import { useGetFields } from "@/features/fields/hooks";
import { RecordCard } from "@/features/records/components/record-card";
import { useGetCurrentPage } from "@/features/records/hooks";
import type { ScrapedDataInput } from "@/features/records/types/form-input";
import type { MatchConfig } from "@/features/records/types/scrape";
import { processField } from "@/features/records/utils/processor";
import { onMessage } from "@/lib/messaging";
import { logger } from "@/utils/logger";

export default function App() {
  const [rawScrapedData, setRawScrapedData] = useState<ScrapedDataInput>();
  const [currentUrl, setCurrentUrl] = useState<string | undefined>();

  const currentPageQuery = useGetCurrentPage(currentUrl);
  const configsQuery = useGetConfigs({ isActive: true });

  const activeConfig = useMemo(() => {
    if (!currentPageQuery.data || !configsQuery.data) return null;

    return configsQuery.data.find((config) =>
      config.domains.some((domain) =>
        new RegExp(domain).test(currentPageQuery.data!.url),
      ),
    );
  }, [currentPageQuery.data, configsQuery.data]);

  const fieldsQuery = useGetFields({ configId: activeConfig?.id });
  const matchConfig = useMemo<MatchConfig | undefined>(() => {
    if (!activeConfig) return undefined;

    return {
      config: activeConfig,
      fields: fieldsQuery.data ?? [],
    };
  }, [activeConfig, fieldsQuery.data]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <>
  useEffect(() => {
    setRawScrapedData(undefined);
  }, [currentUrl]);

  useEffect(() => {
    return onMessage("pageChanged", ({ data }) => {
      setCurrentUrl(data.url);
    });
  }, []);

  useEffect(() => {
    if (!currentPageQuery.data || !matchConfig) return;

    let cancelled = false;

    (async () => {
      const result: ScrapedDataInput = {};

      for (const field of matchConfig.fields) {
        try {
          if (!currentPageQuery.data) continue;

          result[field.name] = await processField(currentPageQuery.data, field);
        } catch (error) {
          logger.error(`Error processing field "${field.name}":`, error);
        }
      }

      if (!cancelled) setRawScrapedData(result);
    })();

    return () => {
      cancelled = true;
    };
  }, [currentPageQuery.data, matchConfig]);

  const title = useMemo(() => {
    if (!matchConfig) {
      return "No matching config found";
    }
    if (!fieldsQuery.data || fieldsQuery.data.length === 0) {
      return "No fields configured";
    }
    return "No data scraped";
  }, [matchConfig, fieldsQuery.data]);

  if (
    currentPageQuery.isFetching ||
    configsQuery.isFetching ||
    fieldsQuery.isFetching
  ) {
    return null;
  }

  if (
    !fieldsQuery.data ||
    fieldsQuery.data.length === 0 ||
    !matchConfig ||
    !rawScrapedData ||
    Object.keys(rawScrapedData).length === 0
  ) {
    return (
      <div className="min-w-screen space-y-4">
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
    <div className="h-screen min-w-screen space-y-4">
      <RecordCard
        fields={matchConfig.fields}
        matchConfig={matchConfig}
        rawScrapedData={rawScrapedData}
        url={currentPageQuery.data?.url || ""}
        className="h-full"
        footerFixedBottom
      />
    </div>
  );
}
