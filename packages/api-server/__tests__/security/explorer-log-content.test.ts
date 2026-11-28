import pino from 'pino';
import {BotService} from '../../src/plugins/services/bot-service';
import {ExplorerService} from '../../src/plugins/services/explorer-service';

function capture() {
  const entries: string[] = [];
  const logger = pino({level: 'trace'}, {write: line => {entries.push(line);}});
  return {logger, output: () => entries.join('')};
}

test('model requests retain operation and timing without logging prompt or provider data', async () => {
  const {logger, output} = capture();
  const prompts = {getPrompt: async () => [[{role:'user', content:'private-fixture-prompt'}], {model:'private-fixture-model'}]};
  const bot = new BotService(logger, 'test-only', prompts as any);
  const completion = jest.spyOn((bot as any).openai.chat.completions, 'create');
  completion.mockResolvedValue({choices: [{message: {content: '{"sql":"SELECT 1"}'}}], usage: {detail:'private-fixture-usage'}});
  expect(await bot.questionToSQL(logger, 'private-fixture-question', {repo_id:1})).toMatch(/SELECT/);
  completion.mockResolvedValue({choices: [{message: {content: '{"CQ":"private-fixture-answer"}'}}]});
  const [answer] = await bot.questionToAnswerInNonStream('private-fixture-question');
  expect(answer?.combinedTitle).toBe('private-fixture-answer');
  expect(output()).toContain('Received model response');
  expect(output()).toContain('durationSeconds');
  expect(output()).not.toContain('private-fixture');
});

test('field writes, retries and plan inspection log outcomes without content or driver errors', async () => {
  const {logger, output} = capture();
  const stream = jest.fn()
    .mockImplementation(async (_title, update) => {
      const answer = {combinedTitle:'private-fixture-answer'};
      await update(answer, 'combinedTitle', answer.combinedTitle);
      throw new Error('private-fixture-provider-response');
    });
  const service = new ExplorerService(logger, {} as any,
    {questionToAnswerInStream: stream, questionToAnswerInNonStream: jest.fn().mockResolvedValue([{combinedTitle:'private-fixture-answer'}, 'private-fixture-text'])},
    {} as any, {} as any, {} as any);
  jest.spyOn(service as any, 'updateQuestion').mockRejectedValueOnce(new Error('private-fixture-driver')).mockResolvedValue(undefined);
  expect(await service.generateAnswer(logger, {id:'fixture-id',title:'private-fixture-question'} as any, true)).toBe('private-fixture-text');
  jest.spyOn(service as any, 'getSQLExecutionPlan').mockResolvedValue([]);
  await service.getSQLExecutionPlanAndEngines(logger, 'SELECT 1 AS private_fixture_column');
  expect(output()).toContain('Retrying answer generation');
  expect(output()).toContain('Failed to update answer field');
  expect(output()).toContain('Requesting query execution plan');
  expect(output()).not.toMatch(/private[-_]fixture/);
});

test('the Sentry transport omits complete log records', () => {
  const options = require('../../src/logger');
  const sentry = options.transport.targets.find((target: {target: string}) => target.target === 'pino-sentry-transport');
  expect(sentry.options.withLogRecord).toBe(false);
});
