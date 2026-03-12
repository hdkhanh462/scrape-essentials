import fs from "node:fs/promises";
import z from "zod";
import { configSchema } from "@/features/scrape-configs/schemas/form-input";

async function generateSchema() {
  const json = z.toJSONSchema(configSchema);

  try {
    await fs.writeFile(
      "public/scrape-config-schema.json",
      JSON.stringify(json, null, 2),
    );
    console.info("Schema generated successfully.");
  } catch (error) {
    console.error("Error writing schema to file:", error);
  }
}

generateSchema();
