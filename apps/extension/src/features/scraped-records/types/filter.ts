export type Operator = ":" | "=" | ">" | "<" | ">=" | "<=";

export type Condition = {
  column: string;
  operator: Operator;
  value: string;
};

export type Expression =
  | { type: "AND"; conditions: Condition[] }
  | { type: "OR"; expressions: Expression[] }
  | { type: "ERROR"; message: string };

export type ArrayExpr =
  | { type: "VALUE"; value: string }
  | { type: "AND"; items: ArrayExpr[] }
  | { type: "OR"; items: ArrayExpr[] };
