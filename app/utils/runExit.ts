import type { Interface } from "readline";

export const runExit = (commandParts: string[], rl: Interface) => {
  const code = commandParts[1] ? parseInt(commandParts[1], 10) : 0;
  rl.close();
  rl.once("close", () => process.exit(code));
};
