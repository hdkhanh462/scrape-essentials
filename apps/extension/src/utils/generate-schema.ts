import fs from "node:fs/promises";
import z from "zod";

import { ConfigSchema } from "@/features/configs/schemas";

async function generateSchema() {
  const json = z.toJSONSchema(ConfigSchema);

  try {
    await fs.writeFile(
      "public/config-schema.json",
      JSON.stringify(json, null, 2),
    );
    console.info("Schema generated successfully.");
  } catch (error) {
    console.error("Error writing schema to file:", error);
  }
}

generateSchema();
