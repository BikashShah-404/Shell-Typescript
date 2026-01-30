import path from "path";

export const paths: String[] = process?.env?.PATH?.split(path.delimiter) ?? [];

export const builtIn: Set<string> = new Set([
  "echo",
  "exit",
  "type",
  "pwd",
  "cd",
  "history",
]);
