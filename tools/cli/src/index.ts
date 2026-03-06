import "reflect-metadata";
import {Command} from "commander";
import {initReloadCollectionCommand} from "@cmd/collection/reload";
import {logger} from "@logger";
import {initVerifyCollectionCommand} from "@cmd/collection/verify";


async function main() {
  const program = new Command();
  program.name('OSSInsight CLI')
    .description('The CLI for OSSInsight.')
    .version('0.0.1');

  const collectionCmd = program.command('collection');
  initReloadCollectionCommand(collectionCmd);
  initVerifyCollectionCommand(collectionCmd);

  program.parse();
}

main().catch((err) => {
  logger.error(err);
});
