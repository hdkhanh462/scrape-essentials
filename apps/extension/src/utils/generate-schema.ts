import fs from "node:fs/promises";
import z from "zod";

import { ConfigSchema } from "@/features/configs/schemas";
import { logger } from "@/utils/logger";

async function generateSchema() {
  const json = z.toJSONSchema(ConfigSchema);

  try {
    await fs.writeFile(
      "public/config-schema.json",
      JSON.stringify(json, null, 2),
    );
    logger.log("Schema generated successfully.");
  } catch (error) {
    logger.error("Error writing schema to file:", error);
  }
}

generateSchema();
