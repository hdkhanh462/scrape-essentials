import { Command as CommandPrimitive } from "cmdk";
import { HistoryIcon, SearchIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useRecordStore } from "@/features/records/stores/record.store";

type Props = {
  value?: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
};

export const SearchHistory: React.FC<Props> = (props) => {
  const { value, placeholder, onChange, onSearch } = props;

  const { t } = useTranslation();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(value);

  const { filterHistory } = useRecordStore((state) => state);
  const { saveFilterHistory, removeFilterHistory } = useRecordStore(
    (state) => state.actions,
  );

  const handleSelect = (val: string) => {
    logger.debug("Selected:", val);

    console.time("select");

    setSearch(val);
    onChange(val);
    setOpen(false);

    if (onSearch) {
      saveFilterHistory(val);
      onSearch(val);
    }

    console.timeEnd("select");
  };

  const handleSearch = () => {
    if (!search?.trim()) return;

    saveFilterHistory(search);

    onSearch?.(search);
    setOpen(false);
  };

  const handleValueChange = (val: string) => {
    setSearch(val);
    onChange(val);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <CommandPrimitive shouldFilter={false} className="w-full max-w-md">
      <CommandPrimitive.Input
        asChild
        value={search}
        onValueChange={handleValueChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen(true)}
      >
        <InputGroup className="shadow-none! ring-0!">
          <InputGroupInput
            value={search ?? ""}
            onChange={() => {}}
            placeholder={placeholder}
          />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          {search?.trim() && (
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleValueChange("")}
              >
                <XIcon className="text-destructive" />
              </InputGroupButton>
            </InputGroupAddon>
          )}
        </InputGroup>
      </CommandPrimitive.Input>

      <div className="relative">
        {open && (
          <div className="fade-in-0 zoom-in-95 absolute top-0 z-10 mt-2 w-full animate-in rounded-md bg-background outline-none">
            <CommandList className="rounded-lg border">
              <CommandGroup heading={t("message.recentSearches")}>
                {filterHistory.length === 0 && (
                  <CommandEmpty>{t("common.noResults")}</CommandEmpty>
                )}

                {filterHistory.map((item) => (
                  <CommandItem
                    key={item}
                    value={item}
                    onMouseDown={(e) => e.preventDefault()}
                    onSelect={handleSelect}
                  >
                    <HistoryIcon className="mr-2 text-muted-foreground" />
                    <span className="flex-1">{item}</span>

                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFilterHistory(item);
                      }}
                    >
                      <XIcon data-slot="command-shortcut" />
                    </Button>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </div>
        )}
      </div>
    </CommandPrimitive>
  );
};
