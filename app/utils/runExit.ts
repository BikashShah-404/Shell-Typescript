import type { Interface } from "readline";
import { writeHistoryOnExit } from "./runHistory";

export const runExit = (commandParts: string[], rl: Interface) => {
  const code = commandParts[1] ? parseInt(commandParts[1], 10) : 0;
  writeHistoryOnExit();
  rl.close();
  rl.once("close", () => process.exit(code));
};
