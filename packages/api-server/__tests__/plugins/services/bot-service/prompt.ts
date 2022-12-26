import {
  SQLExample,
  SQLGeneratePromptTemplate
} from "../../../../src/plugins/services/bot-service/template/GenerateSQLPromptTemplate";


describe('stringifyExample', () => {
  it('should correctly format an example with no spaces', () => {
    const promptTemplate = new SQLGeneratePromptTemplate();
    const example: SQLExample = {
      question: 'What events occurred on the pingcap/tidb repository?',
      sql: "SELECT * FROM github_events WHERE repo_name = 'pingcap/tidb'"
    };
    const expected = `-- What events occurred on the pingcap/tidb repository?
SELECT * FROM github_events WHERE repo_name = 'pingcap/tidb'`;
    expect(promptTemplate.stringifyExample(example)).toBe(expected);
  });

  it('should correctly format an example with leading and trailing spaces', () => {
    const promptTemplate = new SQLGeneratePromptTemplate();
    const example: SQLExample = {
      question: 'What events occurred on the pingcap/tidb repository?',
      sql: '  SELECT * FROM github_events WHERE repo_name = \'pingcap/tidb\'  '
    };
    const expected = `-- What events occurred on the pingcap/tidb repository?
SELECT * FROM github_events WHERE repo_name = 'pingcap/tidb'`;
    expect(promptTemplate.stringifyExample(example)).toBe(expected);
  });

  it('should correctly format an example with multiple spaces', () => {
    const promptTemplate = new SQLGeneratePromptTemplate();
    const example: SQLExample = {
      question: 'What events occurred on the pingcap/tidb repository?',
      sql: '  SELECT   *   FROM   github_events   WHERE   repo_name   =   \'pingcap/tidb\'   '
    };
    const expected = `-- What events occurred on the pingcap/tidb repository?
SELECT * FROM github_events WHERE repo_name = 'pingcap/tidb'`;
    expect(promptTemplate.stringifyExample(example)).toBe(expected);
  });

  it('should correctly format an example with spaces within string literals', () => {
    const promptTemplate = new SQLGeneratePromptTemplate();
    const example: SQLExample = {
      question: 'What events occurred on the pingcap/tidb repository?',
      sql: "SELECT * FROM github_events WHERE repo_name = '  pingcap/tidb  '"
    };
    const expected = `-- What events occurred on the pingcap/tidb repository?
SELECT * FROM github_events WHERE repo_name = '  pingcap/tidb  '`;
    expect(promptTemplate.stringifyExample(example)).toBe(expected);
  });
});
