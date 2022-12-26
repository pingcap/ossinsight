import {
  SQLPlaygroundPromptTemplate
} from "../../../../src/plugins/services/bot-service/template/SQLPlaygroundPromptTemplate";
import {
  QueryPlaygroundSQLPromptTemplate
} from "../../../../src/plugins/services/bot-service/template/QueryPlaygroundPromptTemplate";

describe('prompt template', () => {

  it('sql playground prompt template', () => {
    const promptTemplate = new SQLPlaygroundPromptTemplate();
    const prompt = promptTemplate.stringify('How many contributors in @pingcap/tidb', {
      "my_user_id": 5086433,
      "my_user_login": "Mini256",
      "this_repo_name": "pingcap/tidb",
      "this_repo_id": 41986369,
    });
    expect(prompt).toMatchSnapshot();
  });

  it('query playground prompt template', () => {
    const promptTemplate = new QueryPlaygroundSQLPromptTemplate();
    const prompt = promptTemplate.stringify('How many contributors in @pingcap/tidb', {
      "my_user_id": 5086433,
      "my_user_login": "Mini256"
    });
    expect(prompt).toMatchSnapshot();
  });

});
