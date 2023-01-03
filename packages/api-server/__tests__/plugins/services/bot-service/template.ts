import {
  SQLPlaygroundPromptTemplate
} from "../../../../src/plugins/services/bot-service/template/SQLPlaygroundPromptTemplate";
import {
  QueryPlaygroundSQLPromptTemplate
} from "../../../../src/plugins/services/bot-service/template/QueryPlaygroundPromptTemplate";
import {
  GenerateChartPromptTemplate
} from "../../../../src/plugins/services/bot-service/template/GenerateChartPromptTemplate";

describe('prompt template', () => {

  it('sql playground prompt template should work', () => {
    const promptTemplate = new SQLPlaygroundPromptTemplate();
    const prompt = promptTemplate.stringify('How many contributors in @pingcap/tidb', {
      "my_user_id": 5086433,
      "my_user_login": "Mini256",
      "this_repo_name": "pingcap/tidb",
      "this_repo_id": 41986369,
    });
    expect(prompt).toMatchSnapshot();
  });

  it('query playground prompt template should work', () => {
    const promptTemplate = new QueryPlaygroundSQLPromptTemplate();
    const prompt = promptTemplate.stringify('How many contributors in @pingcap/tidb', {});
    expect(prompt).toMatchSnapshot();
  });

  it('generate chart prompt template should work', () => {
    const promptTemplate = new GenerateChartPromptTemplate();
    const prompt = promptTemplate.stringify('The commits and pushes in @pingcap/tidb across months', [
      {
        "commits": 671,
        "event_month": "2015-09-01",
        "pushes": 521
      },
      {
        "commits": 561,
        "event_month": "2015-10-01",
        "pushes": 426
      },
      {
        "commits": 546,
        "event_month": "2015-11-01",
        "pushes": 399
      },
      {
        "commits": 478,
        "event_month": "2015-12-01",
        "pushes": 343
      }
    ]);
    expect(prompt).toMatchSnapshot();
  });


});
