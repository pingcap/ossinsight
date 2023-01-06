import {AIModel, PromptTemplate} from "../types";

export class GenerateChartPromptTemplate implements PromptTemplate {
  // AI Model Parameters.
  public model: AIModel = AIModel.TEXT_DAVINCI_003;
  public stop: string[] = ['#', '---'];
  public maxTokens: number = 100;
  public temperature: number = 0;
  public topP: number = 0.4;
  public n: number = 1;
  public logprobs: number = 2;

  stringify(question: string, data: any): string {
    return `# TypeScript
type Column = string;
interface Chart { title: string }
interface PieChart extends Chart { label: Column; value: Column }
interface LineChart extends Chart { x: Column; y: Column | Column[]; }
interface BarChart extends Chart  { x: Column; y: Column | Column[]; }
interface MapChart extends Chart  { country_code: Column; value: Column; }
interface NumberCard extends Chart  { label?: Column; value: Column; }
interface RepoCard extends Chart  { repo_name: Column; }
interface PersonalCard extends Chart  { user_login: Column; }
interface Table extends Chart  { columns: Column[]; }

If the result only has one number, use NumberCard
If the result has a column such as country_code, use MapChart
If the result has multiple number columns, use LineChart or BarChart
If the result has a time column and a number column, use LineChart
If the result is a numerical distribution, use BarChart
If the result has a percentage column, use PieChart
If the result is a repository or project list, use RepoCard
If the result is a user list, use PersonalCard
If not sure, use Table

actor_login is the user login of actor

# Example
Question: How many contributors in @pingcap/tidb
Data: [{"contributors": 378}]
Chart: {"chartName": "NumberCard", "title": "Number of Contributors in @pingcap/tidb", "value": "contributors"}

---
Let's think step by step, generate the chart option json for the following question and data.
Question: ${question}
Data: ${JSON.stringify(data)}
Chart: 
`;
  }

}

// # Example
// Question: The star history of @pingcap/tidb
// Data: [{event_month: "2015-09-01", repo_id: 41986369, total: 2541}]
// Chart: {"title": "The Star History of @pingcap/tidb", "chartName": "LineChart", "x": "event_month", "y": "total"}
// # Example
// Question: Geographic distribution of contributors to @pingcap/tidb
// Data: [{country_code: "CN", count: 8883, percentage: 0.5971}]
// Chart: {"title": "The Geographic Distribution of Contributors to @pingcap/tidb ","chartName": "MapChart","country_code": "country_code","value": "count"}
// # Example
// Question: The open source projects similar to tidb?
//   Data: [{repo_id: 41986369, repo_name: "pingcap/tidb"}, {repo_id: 48833910, repo_name: "tilv/tikv"}]
// Chart: {"title": "The Repository List Similar to pingcap/tidb","chartName": "RepoCard","repo_id": "repo_id","repo_name": "repo_name"}
// # Example
// Question: Who has given the most stars on github?
//   Data: [{id: 5086433, actor_login: "Mini256"}]
// Chart: {"title": "The People Who Given the Most Stars on GitHub","chartName": "PersonalCard","id": "id","login": "actor_login"}
// # Example
// Question: The most popular programming languages in @pingcap/tidb
// Data: [{"language": "Go", "percentage": 0.7}, {"language": "Rust", "percentage": 0.3}]
// Chart:{"title": "The Most Popular Programming Languages in @pingcap/tidb","chartName": "PieChart","label": "language","value": "percentage"}