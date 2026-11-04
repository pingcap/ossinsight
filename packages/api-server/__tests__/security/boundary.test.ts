import pino from 'pino';
import { TiDBPlaygroundQueryExecutor } from '../../src/core/executor/query-executor/TiDBPlaygroundQueryExecutor';
import { BotService } from '../../src/plugins/services/bot-service';
import { ExplorerService } from '../../src/plugins/services/explorer-service';
import { PromptManager } from '../../src/plugins/services/bot-service/prompt/prompt-manager';

const log = pino({level:'silent'});
const messages = [{role:'system',content:'Return JSON'}, {role:'user',content:'{"question":"stats"}'}];
const config = {model:'gpt-4o-mini',stop:[],max_tokens:500,temperature:0,top_p:1,n:1};
function bot(answer: any) {
  const manager = {getPrompt: jest.fn().mockResolvedValue([messages,config])} as unknown as PromptManager;
  const service = new BotService(log,'test-key',manager);
  (service as any).openai.chat.completions.create = jest.fn().mockResolvedValue({choices:[{message:{content:JSON.stringify(answer)}}]});
  return service;
}

test.each(['DELETE FROM github_events','SELECT 1; DROP TABLE github_events','SELECT * FROM sys_users'])('executor blocks %s before prepare/execute', async sql => {
  const conn = {execute:jest.fn(),release:jest.fn()};
  const pool = {getConnection:jest.fn().mockResolvedValue(conn)};
  const executor = new TiDBPlaygroundQueryExecutor(pool as any,null,log);
  await expect(executor.executeWithConn(conn as any,'queued-question',{sql})).rejects.toThrow();
  expect(conn.execute).not.toHaveBeenCalled();
});

test('explain uses the same validation and cannot bypass read policy', async () => {
  const conn = {execute:jest.fn().mockResolvedValue([[{id:1}],[]]),release:jest.fn()};
  const executor = new TiDBPlaygroundQueryExecutor({getConnection:jest.fn()} as any,null,log);
  await expect(executor.executeWithConn(conn as any,'explain:explorer','DELETE FROM github_events')).rejects.toThrow();
  expect(conn.execute).not.toHaveBeenCalled();
  await executor.executeWithConn(conn as any,'explain:explorer','SELECT COUNT(*) FROM github_events');
  expect(conn.execute).toHaveBeenLastCalledWith(expect.objectContaining({sql: expect.stringMatching(/^EXPLAIN SELECT/), timeout: 30000}));
});

test('explorer planning never uses application database credentials', async () => {
  const application = {query:jest.fn()};
  const readonly = {execute:jest.fn().mockResolvedValue([[],[]])};
  const explorer = new ExplorerService(log as any,application as any,{} as any,readonly as any,{} as any,{} as any);
  await explorer.getSQLExecutionPlan('SELECT 1');
  expect(application.query).not.toHaveBeenCalled();
  expect(readonly.execute).toHaveBeenCalledWith('explain:explorer','SELECT 1');
});

test('model output is scoped and session identity bound before returning playground SQL', async () => {
  const service = bot({sql:'SELECT * FROM github_events WHERE actor_id=:current_github_id'});
  const sql = await service.questionToSQL(log as any,'my PRs',{repo_id:42,github_id:7});
  expect(sql).toContain('`repo_id` = 42');
  expect(sql).toContain('`actor_id` = 7');
  expect((service as any).openai.chat.completions.create.mock.calls[0][0].messages).toEqual(messages);
});

test.each(['DELETE FROM github_events','SELECT 1; SELECT 2','SELECT * FROM sys_users'])('rejects unsafe model SQL without truncating: %s', async sql => {
  const service = bot({sql});
  await expect(service.questionToAnswerInNonStream('stats')).rejects.toThrow();
  await expect(service.questionToSQL(log as any,'stats',{repo_id:42})).rejects.toThrow();
});

test.each(['', null])('an unanswerable question returns no SQL instead of failing generation: %p', async sql => {
  const [answer] = await bot({RQ:'weather', sqlCanAnswer:false, sql}).questionToAnswerInNonStream('weather');
  expect(answer).toMatchObject({sqlCanAnswer:false, querySQL:null});
});

test('cannot overwrite the validated answer through unknown output fields', async () => {
  const service = bot({sql:'SELECT 1',querySQL:'DELETE FROM github_events'});
  await expect(service.questionToAnswerInNonStream('stats')).rejects.toThrow();
});

test('streaming path validates complete output before invoking callbacks', async () => {
  const service = bot({});
  const callback = jest.fn();
  (service as any).openai.chat.completions.create = jest.fn().mockResolvedValue((async function*() {
    yield {choices:[{delta:{content:'{"RQ":"stats", "sql":"SELECT 1; '}}]};
    yield {choices:[{delta:{content:'DELETE FROM github_events"}'},finish_reason:'stop'}]};
  })());
  await expect(service.questionToAnswerInStream('stats',callback)).rejects.toThrow();
  expect(callback).not.toHaveBeenCalled();
});

test('streaming path returns validated results with the current SDK stream contract', async () => {
  const service = bot({});
  const callback = jest.fn();
  (service as any).openai.chat.completions.create = jest.fn().mockResolvedValue((async function*() {
    yield {choices:[{delta:{content:'{"RQ":"stats", "sql":"SELECT 1"}'},finish_reason:'stop'}]};
  })());
  const [answer] = await service.questionToAnswerInStream('stats',callback);
  expect(answer?.querySQL).toContain('LIMIT 200');
  expect(callback).toHaveBeenCalledWith(answer,'querySQL',answer?.querySQL);
});

test('unavailable prompts block retrieval and model calls', async () => {
  const manager = {getPrompt: jest.fn().mockRejectedValue(new Error('unavailable'))} as unknown as PromptManager;
  const provider = {provide: jest.fn()};
  const service = new BotService(log, 'test-key', manager, provider, 'embedding-explorer-generate-answer');
  const create = jest.fn();
  (service as any).openai.chat.completions.create = create;
  await expect(service.questionToAnswerInNonStream('stats')).rejects.toThrow('unavailable');
  await expect(service.questionToAnswerInStream('stats', jest.fn())).rejects.toThrow('unavailable');
  expect(provider.provide).not.toHaveBeenCalled();
  expect(create).not.toHaveBeenCalled();
});

test('retrieval cannot override the original question', async () => {
  const manager = {getPrompt: jest.fn().mockResolvedValue([messages, config])} as unknown as PromptManager;
  const provider = {provide: jest.fn().mockResolvedValue({question: 'override', examples: 'untrusted'})};
  const service = new BotService(log, 'test-key', manager, provider, 'embedding-explorer-generate-answer');
  (service as any).openai.chat.completions.create = jest.fn().mockResolvedValue({choices:[]});
  await service.questionToAnswerInNonStream('original question');
  expect(manager.getPrompt).toHaveBeenLastCalledWith('embedding-explorer-generate-answer', {
    question: 'original question', examples: 'untrusted',
  });
});

test('ordinary explorer does not send questions to unused retrieval services', async () => {
  const manager = {getPrompt: jest.fn().mockResolvedValue([messages, config])} as unknown as PromptManager;
  const provider = {provide: jest.fn()};
  const service = new BotService(log, 'test-key', manager, provider, 'explorer-generate-answer');
  (service as any).openai.chat.completions.create = jest.fn().mockResolvedValue({choices:[]});
  await service.questionToAnswerInNonStream('stats');
  expect(provider.provide).not.toHaveBeenCalled();
});
