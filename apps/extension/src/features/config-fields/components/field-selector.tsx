import { XIcon } from "lucide-react";
import { Activity, useEffect, useState } from "react";
import { AutoComplete, type Item } from "@/components/auto-complete";
import { Badge } from "@/components/ui/badge";
import { Field } from "@/components/ui/field";
import useDebounce from "@/hooks/use-debounce";

type FetchReturnItem = {
  id: string;
  name: string;
};

type FieldSelectorProps = {
  value: string | undefined;
  placeholder: string;
  onChange: (value: string) => void;
  fetchItems: (value: string) => Promise<FetchReturnItem[]>;
  fetchLabel: (value: string) => Promise<FetchReturnItem | undefined>;
};

export default function FieldSelector(props: FieldSelectorProps) {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<Item<string>[] | undefined>();
  const [loading, setLoading] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!debouncedSearch) return;

      setLoading(true);
      try {
        const results = await props.fetchItems(debouncedSearch);
        setItems(
          results.map((field) => ({
            label: field.name,
            value: field.id.toString(),
          })),
        );
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSearchResults();
  }, [debouncedSearch, props]);

  useEffect(() => {
    const fetchSelectedLabel = async () => {
      if (props.value) {
        const selectedItem = await props.fetchLabel(props.value);
        setSelectedLabel(selectedItem ? selectedItem.name : "");
      } else setSelectedLabel("");
    };
    fetchSelectedLabel();
  }, [props]);

  return (
    <Field>
      <AutoComplete
        selectedValue={props.value}
        searchValue={search}
        items={items}
        isLoading={loading}
        placeholder={props.placeholder}
        emptyMessage="No results found"
        onSelectedValueChange={props.onChange}
        onSearchValueChange={(val) => {
          setItems(undefined);
          setSearch(val);
        }}
      />
      <Activity mode={props.value ? "visible" : "hidden"}>
        <Badge
          variant="outline"
          className="w-fit! cursor-pointer"
          onClick={() => props.onChange("")}
        >
          {selectedLabel}
          <XIcon className="text-destructive" />
        </Badge>
      </Activity>
    </Field>
  );
}
