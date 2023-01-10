import {AIModel, PromptTemplate} from "../types";

export class GenerateSummaryPromptTemplate implements PromptTemplate {
  // AI Model Parameters.
  public model: AIModel = AIModel.TEXT_DAVINCI_003;
  public stop: string[] = ['---'];
  public maxTokens: number = 200;
  public temperature: number = 0.8;
  public topP: number = 1;
  public n: number = 1;

  stringify(question: string, result: any[], length: number, maxWords: number = 40): string {
    const sampleData = result.slice(0, 20);
    const sampleDataValue = JSON.stringify(sampleData);

    return `Question: ${question}}?
Query Result (${length} rows):

some data:

${sampleDataValue}

PingCAP
TiDB

---
Let's think step by step, summarize them and generate a tweet to fill in the following tweet.json file:
---
{
// Generate tweet content does not contain hashtags, and less than ${maxWords} words, and needs to be super attractive, be general and creative.
"content": "",
// Generate 1-5 hashtags without '#'.
"hashtags": []
}
---
tweet.json
---`;
  }

}
