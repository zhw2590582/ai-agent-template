/**
 * Math calculation tool — safe expression evaluator.
 *
 * Uses a recursive-descent parser instead of Function()/eval().
 * Supports: numbers, +, -, *, /, parentheses, unary minus.
 */

import { tool } from 'ai';
import { z } from 'zod';

export type CalculateResult = {
  expression: string;
  result: number;
  formatted: string;
};

/* ------------------------------------------------------------------ */
/*  Safe recursive-descent parser for arithmetic expressions           */
/*  Grammar:                                                           */
/*    expr   → term (('+' | '-') term)*                                */
/*    term   → unary (('*' | '/') unary)*                              */
/*    unary  → '-' unary | primary                                     */
/*    primary→ '(' expr ')' | NUMBER                                   */
/* ------------------------------------------------------------------ */

class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParseError';
  }
}

function evaluate(expression: string): number {
  const tokens = tokenize(expression);
  let pos = 0;

  function peek() {
    return tokens[pos] ?? null;
  }

  function consume(expected?: string) {
    const tok = tokens[pos];
    if (expected !== undefined && tok !== expected) {
      throw new ParseError(`Expected '${expected}' but got '${tok ?? 'end of input'}'`);
    }
    pos++;
    return tok;
  }

  function parseExpr(): number {
    let left = parseTerm();
    while (peek() === '+' || peek() === '-') {
      const op = consume()!;
      const right = parseTerm();
      left = op === '+' ? left + right : left - right;
    }
    return left;
  }

  function parseTerm(): number {
    let left = parseUnary();
    while (peek() === '*' || peek() === '/') {
      const op = consume()!;
      const right = parseUnary();
      if (op === '/') {
        if (right === 0) throw new ParseError('Division by zero');
        left = left / right;
      } else {
        left = left * right;
      }
    }
    return left;
  }

  function parseUnary(): number {
    if (peek() === '-') {
      consume();
      return -parseUnary();
    }
    return parsePrimary();
  }

  function parsePrimary(): number {
    if (peek() === '(') {
      consume('(');
      const value = parseExpr();
      consume(')');
      return value;
    }
    const tok = consume();
    if (tok == null) throw new ParseError('Unexpected end of expression');
    const num = Number(tok);
    if (Number.isNaN(num)) throw new ParseError(`Unexpected token: ${tok}`);
    return num;
  }

  const result = parseExpr();

  if (pos < tokens.length) {
    throw new ParseError(`Unexpected token after expression: ${tokens[pos]}`);
  }

  return result;
}

/** Tokenize an arithmetic expression into numbers and operators. */
function tokenize(expr: string): string[] {
  const tokens: string[] = [];
  let i = 0;

  while (i < expr.length) {
    const ch = expr[i]!;

    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    if ('+-*/()'.includes(ch)) {
      tokens.push(ch);
      i++;
      continue;
    }

    if (/[\d.]/.test(ch)) {
      let num = '';
      while (i < expr.length && /[\d.]/.test(expr[i]!)) {
        num += expr[i];
        i++;
      }
      tokens.push(num);
      continue;
    }

    throw new ParseError(`Invalid character: ${ch}`);
  }

  return tokens;
}

export function runCalculation(expression: string): CalculateResult {
  const normalized = expression.replace(/\s+/g, ' ').trim();

  if (normalized.length === 0) {
    throw new ParseError('Empty expression');
  }

  const result = evaluate(normalized);

  if (!Number.isFinite(result)) {
    throw new ParseError('Result is not a finite number');
  }

  return {
    expression: normalized,
    result,
    formatted: `${normalized} = ${result}`,
  };
}

export const calculate = tool({
  description: 'Evaluate a math expression (supports +, -, *, /, parentheses, decimals).',
  inputSchema: z.object({
    expression: z.string().min(1).describe('Math expression, e.g. (24 * 6) / 3'),
  }),
  execute: async ({ expression }) => runCalculation(expression),
});
