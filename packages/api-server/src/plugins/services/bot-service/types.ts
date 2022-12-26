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