"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const gen_modules_1 = require("./commands/endpoints/gen-modules");
const gen_modules_2 = require("./commands/widgets/gen-modules");
const gen_types_1 = require("./commands/widgets/gen-types");
const logger_1 = require("./logger");
async function main() {
    const program = new commander_1.Command();
    program.name('OSSInsight CLI')
        .description('OSSInsight CLI')
        .version('0.0.1');
    const endpointsCommand = program.command('endpoints');
    (0, gen_modules_1.initEndpointsGenModulesCommand)(endpointsCommand, logger_1.logger);
    const widgetsCommand = program.command('widgets');
    (0, gen_types_1.initWidgetsGenTypesCommand)(widgetsCommand, logger_1.logger);
    (0, gen_modules_2.initWidgetsGenModulesCommand)(widgetsCommand, logger_1.logger);
    program.parse();
}
void main();
