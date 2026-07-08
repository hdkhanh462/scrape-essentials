import { Dexie, type EntityTable } from "dexie";

export type Friend = {
  id: number;
  name: string;
  age: number;
};

export type ScrapeConfig = {
  id: string;
  name: string;
  tags: string[];
  domains: string[];
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
};

export enum FieldType {
  PageUrl = "page-url",

  // Data fields
  Text = "text",
  Link = "link",
  Image = "image",
  ElementAttribute = "element-attribute",

  // Input fields
  InputText = "input-text",
  InputNumber = "input-number",
  InputCheckbox = "input-checkbox",
  InputSelect = "input-select",
  InputMultiSelect = "input-multiselect",

  // Large input fields
  InputTextarea = "input-textarea",
  InputTags = "input-tags",
}

export interface FieldScrapeOptions {
  cssSelector?: string;
  condition?: string;
  attributeName?: string;
  isMultiple?: boolean;
}

export interface FieldUiOptions {
  label?: string;
  placeholder?: string;
  defaultValue?: unknown;
  options?: { label: string; value: string }[];
}

export type ConfigField = {
  id: string;
  order: number;
  configId: string;
  parentFieldId?: string;
  name: string;
  type: FieldType;
  isRequired?: boolean;
  isShowOnTable?: boolean;
  isFilterable?: boolean;
  isPrimary?: boolean;
  isParent?: boolean;
  removers?: string[];
  regex?: string;
  splitter?: string;
  uiOptions?: FieldUiOptions;
  scrapeOptions?: FieldScrapeOptions;
};

export type ScrapedRecord = {
  id: string;
  configId: string;
  key: string;
  data: Record<string, unknown>;
  url: string;
  createdAt: string;
  updatedAt: string;
};

const dexie = new Dexie("ScrapeEssentialsDB") as Dexie & {
  friends: EntityTable<Friend, "id">;
  scrapeConfigs: EntityTable<ScrapeConfig, "id">;
  configFields: EntityTable<ConfigField, "id">;
  scrapedRecords: EntityTable<ScrapedRecord, "id">;
};

dexie
  .version(3)
  .stores({
    scrapeConfigs: "id, name, isActive, tags, createdAt, updatedAt",
    configFields:
      "id, configId, parentFieldId, name, type, order, isShowOnTable",
    scrapedRecords: "id, [configId+key], createdAt, updatedAt",
  })
  .upgrade(async (tx) => {
    const table = tx.table("configFields");
    await table
      .toCollection()
      .modify((field: { splitter?: string; spliter?: string }) => {
        if (field.spliter !== undefined) {
          field.splitter = field.spliter;
          delete field.spliter;
        }
      });

    const configs = tx.table("scrapeConfigs");
    await configs.toCollection().modify((config: { tags?: string[] }) => {
      if (!config.tags) {
        config.tags = [];
      }
    });
  });

export { dexie };
