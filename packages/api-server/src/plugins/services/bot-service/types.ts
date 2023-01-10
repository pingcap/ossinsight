export enum AIModel {
  TEXT_DAVINCI_002 = 'text-davinci-002',
  TEXT_DAVINCI_003 = 'text-davinci-003',
  TEXT_CURIE_001 = 'text-curie-001',
  TEXT_BABBAGE_001 = 'text-babbage-001',
  TEXT_ADA_001 = 'text-ada-001',
}

export interface PromptTemplate {
  stringify(...arg: any[]): string;
}

export interface RecommendQuestion {
  hash: string;
  title: string;
  aiGenerated: boolean;
}

export interface Answer {
  sql?: string;
  chart?: RecommendedChart;
  questions: string[];
}

export interface AnswerSummary {
  content?: string;
  hashtags?: string[];
}

export type RecommendedChart = Record<string, any> & {
  chartName: ChartNames;
}

export type Column = string;

export enum ChartNames {
  PIE_CHART = 'PieChart',
  BAR_CHART = 'BarChart',
  LINE_CHART = 'LineChart',
  TABLE = 'Table',
  MAP_CHART = 'MapChart',
  NUMBER_CARD = 'NumberCard',
  REPO_CARD = 'RepoCard',
  PERSONAL_CARD = 'PersonalCard',
}

export interface Chart {
  title: string
}

export interface PieChart extends Chart {
  label?: Column;
  value?: Column
}

export interface LineChart extends Chart {
  x?: Column;
  y?: Column | Column[];
}

export interface BarChart extends Chart  {
  x?: Column;
  y?: Column | Column[];
}

export interface MapChart extends Chart  {
  country_code?: Column;
  value?: Column;
}

export interface NumberCard extends Chart  {
  label?: Column;
  value?: Column;
}

export interface RepoCard extends Chart  {
  repo_name?: Column;
}

export interface PersonalCard extends Chart  {
  user_login?: Column;
}

export interface Table extends Chart  {
  columns?: Column[];
}
