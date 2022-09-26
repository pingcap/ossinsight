import { Parser, AST, Select } from "node-sql-parser";
import { BadParamsError } from "../core/QueryParam";

export class SqlParser {
  parser: Parser;
  sql: string;
  ast: AST;
  type: string;
  id: number;

  constructor(type: "repo" | "user", id: string, sql: string) {
    this.parser = new Parser();
    this.sql = sql;
    switch (type) {
      case "repo":
        this.type = "repo_id";
        break;
      case "user":
        this.type = "actor_id";
        break;
      default:
        throw new BadParamsError("playground", `invalid type ${type}`);
    }
    this.id = parseInt(id, 10); // consider bigint
    this.ast = this.sqlToAst(sql);
  }

  private sqlToAst(sqlString: string) {
    try {
      const ast = this.parser.astify(sqlString);
      if (Array.isArray(ast) && ast.length > 1) {
        throw new BadParamsError(
          "playground",
          "only one sql statement is allowed"
        );
      } else if (Array.isArray(ast)) {
        return ast[0];
      } else {
        return ast;
      }
    } catch (error) {
      throw new BadParamsError("playground", "invalid sql");
    }
  }

  private validateAst(ast: AST) {
    const type = ast.type;
    switch (type as string) {
      case "desc":
        return ast;
      case "select":
        parseSelectAst(ast as Select, this.type, this.id);
        return ast;
      default:
        throw new BadParamsError(
          "playground",
          "Only SELECT and DESC are allowed"
        );
    }
  }

  private astToString(ast: AST) {
    const parsedSQLStr = this.parser.sqlify(ast);
    return parsedSQLStr;
  }

  public sqlify() {
    const validatedAst = this.validateAst(this.ast);
    return this.astToString(validatedAst);
  }
}

const LIMIT_AST_NODE = {
  seperator: "",
  value: [
    {
      type: "number",
      value: 100,
    },
  ],
};

const WHERE_AST_NODE = (fieldName: string, value: number) => ({
  type: "binary_expr",
  operator: "=",
  left: {
    type: "column_ref",
    table: null,
    column: fieldName,
  },
  right: {
    type: "number",
    value,
  },
});

function parseSelectAst(ast: Select, fieldName: string, value: number) {
  if (ast.type !== "select") {
    throw new BadParamsError("playground", "Only allow select statement.");
  }
  if (ast.with) {
    throw new BadParamsError("playground", "Do not allow with statement.");
  }
  const { where, from, limit } = ast;
  // Add limit
  if (limit?.value && limit.value[0]?.value > 100) {
    limit.value[0].value = 100;
  } else if (!limit?.value?.length) {
    ast.limit = LIMIT_AST_NODE;
  }
  // Check from clause
  from &&
    from.length > 0 &&
    from.forEach((fromItem) => {
      const fromItemAst = fromItem?.expr?.ast as Select | undefined;
      fromItemAst && parseSelectAst(fromItemAst, fieldName, value);
    });
  // Wrap where clause
  if (!where) {
    ast.where = WHERE_AST_NODE(fieldName, value);
  } else {
    ast.where = {
      type: "binary_expr",
      operator: "AND",
      left: where,
      right: WHERE_AST_NODE(fieldName, value),
    };
  }
}

export const SESSION_LIMITS = [
  `SET SESSION tidb_isolation_read_engines="tikv,tidb";`,
  `SET SESSION tidb_mem_quota_query=8 << 23;`,
  `SET SESSION tidb_enable_rate_limit_action = false;`,
  `SET SESSION tidb_enable_paging=true;`,
  `SET SESSION tidb_executor_concurrency=1;`,
  `SET SESSION tidb_distsql_scan_concurrency=5;`,
];
