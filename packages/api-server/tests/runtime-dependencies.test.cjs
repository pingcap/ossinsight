const {test} = require('node:test');
const assert = require('node:assert/strict');
const {mkdtemp, rm} = require('node:fs/promises');
const {tmpdir} = require('node:os');
const {join} = require('node:path');
const {AsyncDatabase} = require('promised-sqlite3');
const {saveQueryResultToSqlite} = require('../dist/utils/sqlite');
const OpenAI = require('openai');

test('SQLite export preserves bound values and quoted query-result column aliases', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'ossinsight-sqlite-test-'));
  const filename = join(directory, 'result.sqlite');
  const alias = 'value"); DROP TABLE result; --';
  const rows = [{[alias]: "a'; DROP TABLE result; --", total: 7}];
  try {
    await saveQueryResultToSqlite({fields: [{name: alias, columnType: 253}, {name: 'total', columnType: 8}], rows}, filename);
    const db = await AsyncDatabase.open(filename);
    try {
      assert.deepEqual(await db.all('SELECT * FROM result'), rows);
      await db.run('BEGIN');
      await db.run('UPDATE result SET total = ?', 99);
      await db.run('ROLLBACK');
      assert.equal((await db.get('SELECT total FROM result')).total, 7);
    } finally {await db.close();}
  } finally {await rm(directory, {recursive: true, force: true});}
});

test('OpenAI SDK retains chat completion requests and streaming parsing without network access', async () => {
  const requests = [];
  const client = new OpenAI({apiKey: 'synthetic-test-key', maxRetries: 0, fetch: async (_url, init) => {
    const body = JSON.parse(init.body);
    requests.push(body);
    if (body.stream) {
      const chunk = {id: 'test', object: 'chat.completion.chunk', choices: [{index: 0, delta: {content: 'safe'}, finish_reason: null}]};
      return new Response(`data: ${JSON.stringify(chunk)}\n\ndata: [DONE]\n\n`, {headers: {'content-type': 'text/event-stream'}});
    }
    return Response.json({id: 'test', object: 'chat.completion', choices: [{index: 0, message: {role: 'assistant', content: 'safe'}, finish_reason: 'stop'}]});
  }});
  const params = {model: 'gpt-4o-mini', messages: [{role: 'user', content: 'synthetic test'}], max_tokens: 10};
  assert.equal((await client.chat.completions.create(params)).choices[0].message.content, 'safe');
  let text = '';
  for await (const chunk of await client.chat.completions.create({...params, stream: true})) text += chunk.choices[0]?.delta?.content || '';
  assert.equal(text, 'safe');
  assert.deepEqual(requests, [params, {...params, stream: true}]);
});
