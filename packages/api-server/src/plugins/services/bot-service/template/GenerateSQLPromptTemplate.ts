import {DateTime} from "luxon";
import {AIModel, PromptTemplate} from "../types";

export interface SQLExample {
  question: string;
  sql: string;
}

export interface TableInfo {
  name: string;
  columns: ColumnInfo[];
  comments?: string[];
}

export interface RelationInfo {
  leftTableName: string;
  leftColumnName: string;
  rightTableName: string;
  rightColumnName: string;
}

export interface ColumnInfo {
  name: string;
  type?: string;
  enums?: string[];
  invalid?: any[];
  comments?: string[];
}

export class SQLGeneratePromptTemplate implements PromptTemplate {
  public readonly SQLDialect: string = 'MySQL';

  public comments: string[];
  public tables: TableInfo[];
  public relations: RelationInfo[];
  public examples: SQLExample[];

  // AI Model Parameters.
  public model: AIModel = AIModel.TEXT_DAVINCI_003;
  public stop: string[] = ['#', '---'];
  public maxTokens: number = 200;
  public temperature: number = 0.3;
  public topP: number = 0.4;
  public n: number = 1;
  public logprobs: number = 2;
  public resultPrefix: string = 'SELECT ';

  constructor(
    sqlDialect: string = 'MySQL',
    tables: TableInfo[] = [],
    relations: RelationInfo[] = [],
    examples: SQLExample[] = [],
    comments: string[] = [],
  ) {
    this.SQLDialect = sqlDialect;
    this.tables = tables;
    this.relations = relations;
    this.examples = examples;
    this.comments = comments;
  }

  stringify(question: string, context: Record<string, any>): string {
    return `# ${this.SQLDialect} SQL
${this.tables.map(t => this.stringifyTable(t)).join('\n')}
${this.relations.map(r => this.stringifyRelation(r)).join('\n')}
${context ? Object.entries(context).map(([k, v]) => this.stringifyContext(k, v)).join('\n') : ''}
${this.comments.join('\n')}
---
${this.examples.map(e => this.stringifyExample(e, context)).join('\n')}
---
-- Let's think step by step, generate one correct SQL to do query: ${question}
---
${this.resultPrefix}
`;
  }

  stringifyContext(key: string, value: any): string {
    return `Define ${key} = ${this.stringifyValue(value)}`;
  }

  stringifyValue(value: any): string {
    if (typeof value === 'string') {
      return `'${value}'`;
    } else if (Array.isArray(value)) {
      return `[${value.map(v => this.stringifyValue(v)).join(', ')}]`;
    } else if (value instanceof Date) {
      return DateTime.fromJSDate(value).toSQL();
    } else if (value === null) {
      return 'null';
    } else {
      return value;
    }
  }

  stringifyTable(table: TableInfo): string {
    const tableDefinition = `Table ${table.name}, columns = [${table.columns.map(c => c.name).join(', ')}]`;
    const columnDefinitions = table.columns.map(c => this.stringifyColumn(c)).filter(c => c !== undefined);
    const comments = table.comments || [];
    const definitions = [tableDefinition];
    if (columnDefinitions.length > 0) {
      definitions.push(columnDefinitions.join('\n'));
    }
    if (comments.length > 0) {
      definitions.push(comments.join('\n'));
    }
    return definitions.join('\n');
  }

  stringifyColumn(column: ColumnInfo): string | undefined {
    const definitions = [];
    if (column.type) {
      definitions.push(`type = ${column.type}`);
    }
    if (column.enums) {
      definitions.push(`enums = [${column.enums.map(e => `'${e}'`).join(', ')}]`);
    }
    if (column.invalid) {
      definitions.push(`invalid = [${column.invalid.map(v => this.stringifyValue(v)).join(', ')}]`);
    }
    if (column.comments) {
      definitions.push(column.comments.join(', '));
    }
    if (definitions.length > 0) {
      return `Column ${column.name}, ${definitions.join(', ')}`;
    } else {
      return undefined;
    }
  }

  stringifyRelation(relations: RelationInfo): string {
    return `Relation ${relations.leftTableName}.${relations.leftColumnName} = ${relations.rightTableName}.${relations.rightColumnName}`;
  }

  stringifyExample(example: SQLExample, context: Record<string, any> = {}): string {
    let sql = example.sql;

    // Replace multiple spaces outside string literals with a single space
    sql = sql.replace(/\s+(?=(?:[^']*'[^']*')*[^']*$)/g, ' ');
    // Remove leading and trailing whitespace from each line.
    sql = sql.replace(/^\s+|\s+$/gm, '');

    // Replace context variables with their values, {{key}}.
    for (const [k, v] of Object.entries(context)) {
      sql = sql.replace(new RegExp(`{{${k}}}`, 'g'), this.stringifyValue(v));
    }

    return `-- ${example.question}\n${sql}`;
  }

}
