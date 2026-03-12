import { Command as CommandPrimitive } from "cmdk";
import { Check, SearchIcon } from "lucide-react";
import { Activity, useState } from "react";

import Loader from "@/components/loader";
import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

export type Item<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  selectedValue: T | undefined;
  searchValue: string;
  items?: Item<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  placeholder?: string;
  onSelectedValueChange: (value: T) => void;
  onSearchValueChange: (value: string) => void;
};

export function AutoComplete<T extends string>({
  selectedValue,
  searchValue,
  items,
  isLoading,
  emptyMessage = "No items.",
  placeholder = "Search...",
  onSelectedValueChange,
  onSearchValueChange,
}: Props<T>) {
  const [open, setOpen] = useState(false);

  const handleSelectItem = (inputValue: string) => {
    onSelectedValueChange(
      inputValue === selectedValue ? ("" as T) : (inputValue as T),
    );
    setOpen(false);
  };

  const handleValueChange = async (value: string) => {
    onSearchValueChange(value);
    if (!open) setOpen(true);
  };

  return (
    <CommandPrimitive shouldFilter={false}>
      <CommandPrimitive.Input
        asChild
        value={searchValue}
        onValueChange={handleValueChange}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <InputGroup className="shadow-none! ring-0!">
          <InputGroupInput placeholder={placeholder} />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
      </CommandPrimitive.Input>
      <div className="relative mt-2">
        <Activity mode={open && searchValue ? "visible" : "hidden"}>
          <div className="fade-in-0 zoom-in-95 absolute top-0 z-10 w-full animate-in rounded-md bg-background outline-none">
            <CommandList className="rounded-lg border">
              {/* Loading */}
              <Activity
                mode={open && isLoading && searchValue ? "visible" : "hidden"}
              >
                <CommandPrimitive.Loading>
                  <div className="flex items-center justify-center py-6">
                    <Loader isLoading />
                  </div>
                </CommandPrimitive.Loading>
              </Activity>
              <Activity
                mode={open && !isLoading && searchValue ? "visible" : "hidden"}
              >
                {/* Items */}
                <Activity
                  mode={items && items.length > 0 ? "visible" : "hidden"}
                >
                  <CommandGroup>
                    {items?.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onMouseDown={(e) => e.preventDefault()}
                        onSelect={handleSelectItem}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedValue === option.value
                              ? "visible"
                              : "invisible",
                          )}
                        />
                        {option.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Activity>

                {/* Empty State */}
                <Activity
                  mode={items && items.length === 0 ? "visible" : "hidden"}
                >
                  <CommandEmpty>{emptyMessage}</CommandEmpty>
                </Activity>
              </Activity>
            </CommandList>
          </div>
        </Activity>
      </div>
    </CommandPrimitive>
  );
}
