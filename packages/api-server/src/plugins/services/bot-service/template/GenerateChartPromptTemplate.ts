import {AIModel, PromptTemplate} from "../types";

export class GenerateChartPromptTemplate implements PromptTemplate {
  // AI Model Parameters.
  public model: AIModel = AIModel.TEXT_DAVINCI_003;
  public stop: string[] = ['#', '---'];
  public maxTokens: number = 100;
  public temperature: number = 0.3;
  public topP: number = 0.4;
  public n: number = 1;
  public logprobs: number = 2;

  stringify(question: string, data: any): string {
    return `# TypeScript
interface Chart { title: string}
interface PieChart extends Chart {value: number}
interface LineChart  extends Chart {x: any;y: any;}
interface BarChart extends Chart  {x: any;y: any;}
interface MapChart extends Chart  {country_code: string;value: any;}
interface RepoCard extends Chart  {repo_id: number;repo_name: string;}
interface PersonalCard extends Chart  {repo_id: number;repo_name: string;}
# Example
Question: The star history of @pingcap/tidb
Data: [{event_month: "2015-09-01", repo_id: 41986369, total: 2541}]
Chart: 
{
  "title": "The Star History of @pingcap/tidb",
  "chartName": "LineChart",
  "x": "event_month",
  "y": "total"
}
# Example
Question: Geographic distribution of contributors to @pingcap/tidb  
Data: [{country_or_area: "CN", count: 8883, percentage: 0.5971}]
Chart: 
{
  "title": "The Geographic Distribution of Contributors to @pingcap/tidb ",
  "chartName": "MapChart",
  "country_code": "country_or_area",
  "value": "count"
}
# Example
Question: The open source projects similar to tidb?
Data:  [{repo_id: 41986369, repo_name: "pingcap/tidb"}, {repo_id: 48833910, repo_name: "tilv/tikv"}]
Chart: 
{
  "title": "The Repository List Similar to pingcap/tidb",
  "chartName": "RepoCard",
  "repo_id": "repo_id",
  "repo_name": "repo_name"
}
# Example
Question: Who has given the most stars on github?
Data:  [{id: 5086433, actor_login: "Mini256"}]
Chart: 
{
   "title": "The People Who Given the Most Stars on GitHub",
  "chartName": "PersonalCard",
  "id": "id",
  "login": "actor_login"
}
---
Question: ${question}
Data: ${JSON.stringify(data)}
Chart: 
`;
  }

}
