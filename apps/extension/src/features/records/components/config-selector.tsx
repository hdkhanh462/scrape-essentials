import { ChevronsUpDownIcon, RefreshCwIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useGetConfigs } from "@/features/configs/hooks";
import { recordQueryKey } from "@/features/records/hooks";
import { useRecordStore } from "@/features/records/stores/record.store";
import { queryClient } from "@/features/shared/query-client";

export const ConfigSelector = () => {
  const [open, setOpen] = useState(false);

  const { configId } = useRecordStore();
  const { setConfigId } = useRecordStore((state) => state.actions);

  const { data: configs } = useGetConfigs({});

  const handleRefresh = () => {
    queryClient.invalidateQueries({
      queryKey: recordQueryKey.list({ configId }),
    });
  };

  const t = browser.i18n.getMessage;

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            size="sm"
            aria-expanded={open}
            className="h-8 w-full max-w-35 justify-between lg:max-w-62"
          >
            {configId && configs
              ? configs.find((config) => config.id === configId)?.name
              : t("selectConfig")}
            <ChevronsUpDownIcon className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-50 p-0">
          <Command
            filter={(_, search, keywords) => {
              if (keywords?.[0].toLowerCase().includes(search.toLowerCase()))
                return 1;
              return 0;
            }}
          >
            <CommandInput placeholder={t("searchConfig")} className="h-9" />
            <CommandList>
              <CommandEmpty>{t("noResults")}</CommandEmpty>
              <CommandGroup>
                {configs?.map((config) => (
                  <CommandItem
                    key={config.id}
                    value={config.id}
                    keywords={[config.name]}
                    data-checked={configId === config.id}
                    onSelect={(currentValue) => {
                      setConfigId(currentValue);
                      setOpen(false);
                    }}
                  >
                    {config.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {configId && (
        <Button
          variant="outline"
          size="sm"
          className="h-8"
          onClick={handleRefresh}
        >
          <RefreshCwIcon />
          {t("refresh")}
        </Button>
      )}
    </div>
  );
};
