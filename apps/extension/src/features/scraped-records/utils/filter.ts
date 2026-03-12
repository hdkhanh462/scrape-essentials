/** biome-ignore-all lint/suspicious/noExplicitAny: <> */

import type { FilterFn } from "@tanstack/react-table";
import type {
  ArrayExpr,
  Condition,
  Expression,
  Operator,
} from "@/features/scraped-records/types/filter";

function splitOrAtRoot(input: string): string[] {
  const result: string[] = [];
  let depth = 0;
  let current = "";

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (char === "(") depth++;
    if (char === ")") depth--;

    if (char === "|" && depth === 0) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    result.push(current.trim());
  }

  return result;
}

function splitAtRoot(input: string, separator: string): string[] {
  const result: string[] = [];
  let depth = 0;
  let current = "";

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (char === "(") depth++;
    if (char === ")") depth--;

    if (char === separator && depth === 0) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    result.push(current.trim());
  }

  return result;
}

function parseFilter(input: string): Expression | null {
  if (!input.trim()) return null;

  // ===== OR =====
  const orParts = splitAtRoot(input, "|");

  if (orParts.length > 1) {
    return {
      type: "OR",
      expressions: orParts.map(parseFilter).filter(Boolean) as Expression[],
    };
  }

  // ===== AND =====
  const andParts = splitAtRoot(input, "&");

  const conditions: Condition[] = [];

  const regex = /(\w+)(>=|<=|=|>|<|:)(?:"([^"]+)"|([^\s&|]+))/g;

  for (const part of andParts) {
    let match = regex.exec(part);
    while (match !== null) {
      conditions.push({
        column: match[1],
        operator: match[2] as Operator,
        value: match[3] ?? match[4],
      });
      match = regex.exec(part);
    }
  }

  if (conditions.length === 0) {
    return { type: "ERROR", message: "Invalid filter syntax" };
  }

  return { type: "AND", conditions };
}

function parseArrayExpression(input: string): ArrayExpr {
  input = input.trim();

  // remove outer parentheses
  if (input.startsWith("(") && input.endsWith(")")) {
    return parseArrayExpression(input.slice(1, -1));
  }

  // OR has lower priority
  if (input.includes("|")) {
    return {
      type: "OR",
      items: input.split("|").map(parseArrayExpression),
    };
  }

  // AND
  if (input.includes(",")) {
    return {
      type: "AND",
      items: input.split(",").map(parseArrayExpression),
    };
  }

  return { type: "VALUE", value: input };
}

function evaluateArrayExpr(expr: ArrayExpr, rowValues: string[]): boolean {
  switch (expr.type) {
    case "VALUE":
      return rowValues.some((v) => v.includes(expr.value.toLowerCase()));

    case "AND":
      return expr.items.every((e) => evaluateArrayExpr(e, rowValues));

    case "OR":
      return expr.items.some((e) => evaluateArrayExpr(e, rowValues));
  }
}

function evaluateCondition(row: any, condition: Condition, columnMeta: any) {
  const cellValue = row.getValue(condition.column);
  if (cellValue == null) return false;

  const type = columnMeta?.type;

  switch (type) {
    // ================== ARRAY STRING ==================
    case "string[]": {
      if (!Array.isArray(cellValue)) return false;

      const rowValues = cellValue.map((v: string) => v.toLowerCase());

      const arrayExpr = parseArrayExpression(condition.value.toLowerCase());

      return evaluateArrayExpr(arrayExpr, rowValues);
    }

    // ================== NUMBER ==================
    case "number": {
      const v = Number(cellValue);
      const f = Number(condition.value);
      if (Number.isNaN(f)) return false;

      if (condition.operator === ":") {
        return String(v).includes(String(f));
      }

      return {
        ">": v > f,
        "<": v < f,
        ">=": v >= f,
        "<=": v <= f,
        "=": v === f,
      }[condition.operator];
    }

    // ================== BOOLEAN ==================
    case "boolean":
      return String(cellValue) === condition.value;

    // ================== STRING ==================
    default:
      return String(cellValue)
        .toLowerCase()
        .includes(condition.value.toLowerCase());
  }
}

export const advancedGlobalFilter: FilterFn<any> = (
  row,
  _columnId,
  filterValue,
) => {
  if (!filterValue) return true;

  const expression = parseFilter(filterValue);

  if (!expression || expression.type === "ERROR") {
    console.error("Filter parse error:", expression?.message);
    return true; // fail-safe
  }

  const evaluateExpression = (expr: Expression): boolean => {
    switch (expr.type) {
      case "AND":
        return expr.conditions.every((cond) => {
          const column = row
            .getAllCells()
            .find((c) => c.column.id === cond.column);
          if (!column) return false;

          return evaluateCondition(row, cond, column.column.columnDef.meta);
        });

      case "OR":
        return expr.expressions.some(evaluateExpression);

      case "ERROR":
        return true; // fail-safe
    }
  };

  return evaluateExpression(expression);
};
