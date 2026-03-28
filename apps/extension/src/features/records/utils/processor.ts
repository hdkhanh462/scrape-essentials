import type { CurrentPage } from "@/features/records/types/scrape";
import { type ConfigField, dexie, FieldType } from "@/lib/dexie";

function processElement(element: Element, field: ConfigField) {
  switch (field.type) {
    case FieldType.Text:
      return element.textContent.trim();
    case FieldType.Link:
      return (element as HTMLAnchorElement).href.trim();
    case FieldType.Image:
      return (element as HTMLImageElement).src.trim();
    case FieldType.ElementAttribute:
      if (!field.scrapeOptions?.attributeName) return "";
      return (
        element.getAttribute(field.scrapeOptions.attributeName)?.trim() || ""
      );
    default:
      return "";
  }
}

function processDataQuery(elm: Document | Element, field: ConfigField) {
  if (!field.scrapeOptions) return "";

  if (field.scrapeOptions.isMultiple) {
    const elements = elm.querySelectorAll(
      field.scrapeOptions.cssSelector || "",
    );
    const results: string[] = [];
    elements.forEach((element) => {
      const value = processElement(element, field);
      if (value) results.push(value);
    });
    return results;
  } else if (field.scrapeOptions.cssSelector === "") {
    return elm.textContent?.trim() || "";
  } else {
    const element = elm.querySelector(field.scrapeOptions.cssSelector || "");
    if (!element) return "";
    return processElement(element, field);
  }
}

async function processScrapeField(bodyHtml: string, field: ConfigField) {
  const body = new DOMParser().parseFromString(bodyHtml, "text/html");
  if (!field.scrapeOptions) return "";

  if (field.parentFieldId) {
    const parentField = await dexie.configFields.get(field.parentFieldId);
    if (!parentField || !parentField.scrapeOptions?.cssSelector) {
      throw Error(
        `Parent field with ID "${field.parentFieldId}" not found or missing cssSelector`,
      );
    }
    const parentElements = body.querySelectorAll(
      parentField.scrapeOptions.cssSelector,
    );
    let tempValue: string | string[] = "";
    parentElements.forEach((element) => {
      const _text = element.textContent || "";
      const conditionMet =
        field.scrapeOptions?.condition &&
        _text.includes(field.scrapeOptions.condition);

      if (conditionMet) tempValue = processDataQuery(element, field);
    });
    return tempValue;
  }

  return processDataQuery(body, field);
}

function processTextField(value: string, field: ConfigField) {
  if (field.regex) {
    const match = value.match(field.regex);
    value = match && match.length > 1 ? match[1].trim() : "";
  }

  if (field.removers) {
    value = field.removers.reduce(
      (acc, remover) => acc.split(remover).join(""),
      value,
    );
  }

  return value;
}

export async function processField(
  currentPage: CurrentPage,
  field: ConfigField,
) {
  let value: string | string[] = "";

  switch (true) {
    case field.type === FieldType.PageUrl:
      value = currentPage.url;
      break;
    case isScrapeFieldType(field.type):
      value = await processScrapeField(currentPage.bodyHtml, field);
      break;
    default:
      break;
  }

  if (
    !isInputFieldType(field.type) &&
    !isSelectFieldType(field.type) &&
    typeof value === "string"
  ) {
    value = processTextField(value, field);
    if (field.spliter) {
      value = value
        .split(field.spliter)
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }
  }

  if (
    !isInputFieldType(field.type) &&
    !isSelectFieldType(field.type) &&
    Array.isArray(value) &&
    value.length > 0
  ) {
    value = value
      .map((item) => processTextField(item, field))
      .filter((item) => item.length > 0);
  }

  if (
    !isInputFieldType(field.type) &&
    !isSelectFieldType(field.type) &&
    field.isRequired &&
    !value
  ) {
    throw Error(
      `The field "${field.name}" is required, ${JSON.stringify(field, null, 2)}`,
    );
  }

  return value;
}
