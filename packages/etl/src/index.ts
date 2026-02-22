#!/usr/bin/env node
import "dotenv/config";
import { Command } from "commander";
import { importHourlyCommand, importRangeCommand } from "./commands/import.js";

const program = new Command("ossinsight-etl")
  .description(
    "OSSInsight ETL — imports GitHub Archive data into TiDB (Node.js replacement for the legacy Ruby ETL)"
  )
  .version("0.0.1");

const importCommand = new Command("import")
  .description("Import GH Archive data")
  .addCommand(importHourlyCommand)
  .addCommand(importRangeCommand);

program.addCommand(importCommand);

program.parseAsync(process.argv).catch((err) => {
  console.error(err);
  process.exit(1);
});
