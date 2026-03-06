import { Command } from 'commander';
import { initEndpointsGenModulesCommand } from './commands/endpoints/gen-modules';
import { initWidgetsGenModulesCommand } from './commands/widgets/gen-modules';
import { initWidgetsGenTypesCommand } from './commands/widgets/gen-types';
import { logger } from './logger';

async function main () {
  const program = new Command();
  program.name('OSSInsight CLI')
    .description('OSSInsight CLI')
    .version('0.0.1');

  const endpointsCommand = program.command('endpoints');
  initEndpointsGenModulesCommand(endpointsCommand, logger);

  const widgetsCommand = program.command('widgets');
  initWidgetsGenTypesCommand(widgetsCommand, logger);
  initWidgetsGenModulesCommand(widgetsCommand, logger);

  program.parse();
}

void main();