# AI Prompt — Generate an importable config

Copy the prompt below, fill in the two `<...>` placeholders, and paste it into
an AI LLM (ChatGPT, Claude, ...). Paste the JSON it returns into a `.json`
file and import it from the config list's **Import** button.

The JSON schema below is generated from `apps/extension/public/config-schema.json`
— regenerate that file (`bun run generate-schema` in `apps/extension`) and
update this doc if the schema changes.

## Prompt

````text
You are generating an import config for a browser extension that scrapes data from web pages.

Website URL: <paste the URL of the website to scrape>

Fields to save:
<list every field you want to save, one per line, e.g.:
- Product name (scraped from the page)
- Price (scraped from the page)
- Image (scraped from the page, may have multiple)
- Category (manually selected from a fixed list of options when saving)>

Return a single JSON object that strictly matches this JSON Schema (no markdown fences, no comments, no extra text before or after it):

<paste the full contents of apps/extension/public/config-schema.json here>

Rules to follow:
- "domains" must contain the domain(s) parsed from the website URL above.
- Add one entry in "fields" for each field listed above, in the given order (set "order" starting at 0).
- Use "type": "text" | "link" | "image" | "element-attribute" with "scrapeOptions.cssSelector" (and "attributeName" for "element-attribute") for values scraped from the page's HTML.
- Set "scrapeOptions.isMultiple": true only for fields that can have multiple values on the page — the extracted value becomes an array.
- Use "type": "page-url" for a field that stores the scraped page's URL.
- Use "input-text" | "input-number" | "input-checkbox" | "input-textarea" | "input-tags" | "input-select" | "input-multiselect" only for fields the user fills in manually, not scraped from the page ("input-select"/"input-multiselect" require a non-empty "uiOptions.options" list).
- Exactly one field among the scraped ("text" | "link" | "image" | "element-attribute") or "page-url" fields must have "isPrimary": true — it is used as the unique identifier for a record. Manual input fields must not be primary.
- Output raw JSON only, ready to be imported as-is.
````
