import {AIModel, PromptTemplate} from "../types";

export class GenerateChartPromptTemplate implements PromptTemplate {
  // AI Model Parameters.
  public model: AIModel = AIModel.TEXT_DAVINCI_003;
  public stop: string[] = ['#', '---'];
  public maxTokens: number = 50;
  public temperature: number = 0.3;
  public topP: number = 0.4;
  public n: number = 1;
  public logprobs: number = 2;

  stringify(data: any): string {
    return `# TypeScript
interface Chart {}
interface PieChart extends Chart {value: number}
interface LineChart  extends Chart {x: any;y: any;}
interface BarChart extends Chart  {x: any;y: any;}
interface MapChart extends Chart  {country_code: string;value: any;}
interface RepoCard extends Chart  {repo_id: number;repo_name: string;}
interface PersonalCard extends Chart  {repo_id: number;repo_name: string;}
# Example
Data: [{event_month: "2015-09-01", repo_id: 41986369, total: 2541}]
Chart: new LineChart({ x: 'event_month', y: 'total' })
# Example
Data: [{country_or_area: "CN", count: 8883, percentage: 0.5971}]
Chart: new MapChart({ country_code: 'country_or_area', value: 'count' })
# Example
Data: [{repo_id: 41986369, repo_name: "pingcap/tidb"}, {repo_id: 48833910, repo_name: "tilv/tikv"}]
Chart: new RepoCard({ repo_id: 'repo_id', repo_name: 'repo_name' })
# Example
Data:  [{id: 41986369, login: "Mini256"}]
Chart: new PersonalCard({ id: 'id', login: 'login' })
---
# Question
Data: ${JSON.stringify(data)}
Chart:
`;
  }

}
