import { useState } from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
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
import { selectConfigId } from "@/features/scraped-records/store/record.selectors";
import { setConfigId } from "@/features/scraped-records/store/record.slice";
import { cn } from "@/lib/utils";

export const ConfigSelector = () => {
  const [open, setOpen] = useState(false);

  const dispatch = useDispatch();
  const configId = useSelector(selectConfigId);

  const { data: configs } = useGetConfigs({});

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full max-w-35 justify-between lg:max-w-62"
        >
          {configId && configs
            ? configs.find((config) => config.id === configId)?.name
            : "Select config..."}
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
          <CommandInput placeholder="Search config..." className="h-9" />
          <CommandList>
            <CommandEmpty>No config found.</CommandEmpty>
            <CommandGroup>
              {configs?.map((config) => (
                <CommandItem
                  key={config.id}
                  value={config.id}
                  keywords={[config.name]}
                  onSelect={(currentValue) => {
                    dispatch(setConfigId(currentValue));
                    setOpen(false);
                  }}
                >
                  {config.name}
                  <CheckIcon
                    className={cn(
                      "ml-auto",
                      configId === config.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
