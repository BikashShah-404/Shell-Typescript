import { createInterface } from "readline";
import readline from "readline";
import path from "path";
import os from "os";

import { runEcho } from "./utils/runEcho.ts";
import { runCustomCommand } from "./utils/handleCustomCommands.ts";
import { runType } from "./utils/runType.ts";
import { runExit } from "./utils/runExit.ts";
import { runPwd } from "./utils/runPwd.ts";
import { runCd } from "./utils/runCd.ts";
import {
  commandHistory,
  handleHistoryNavigation,
  readHistoryOnStartUp,
  runHistory,
  setHistoryIndex,
} from "./utils/runHistory.ts";
import { handleAutoComplete } from "./utils/handleAutoComplete.ts";

process.env.HISTFILE = process.env.HISTFILE
  ? process.env.HISTFILE
  : path.join(os.homedir(), "history.txt");

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.setPrompt("$ ");
rl.prompt();

readHistoryOnStartUp();

rl.on("line", (command: string) => {
  // split(/s+/) - splits the string into parts wherever there are one or more whitespace characters.
  if (
    command.trim() &&
    commandHistory[commandHistory.length - 1] !== command.trim()
  ) {
    commandHistory.push(command.trim());
  }
  setHistoryIndex(-1);

  const commandParts = command.trim().split(/\s+/);

  if (commandParts[0] === "exit") {
    runExit(commandParts, rl);
    return;
  } else if (commandParts[0] === "echo") {
    runEcho(commandParts);
  } else if (commandParts[0] === "type") {
    commandParts[1] && runType(commandParts[1]);
  } else if (commandParts[0] === "pwd") {
    runPwd();
  } else if (commandParts[0] === "cd") {
    runCd(commandParts[1]);
  } else if (commandParts[0] === "history") {
    const [command, ...args] = commandParts;
    if (command) {
      runHistory(args);
    }
  } else {
    const [command, ...args] = commandParts;
    if (command) {
      const childproc = runCustomCommand(command, args);
      childproc.on("close", () => rl.prompt());
      return;
    }
  }
  rl.prompt();
});

// handle History Navigation
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

process.stdin.on("keypress", (_, key) => {
  if (!key) return;
  if (key.name === "up" || key.name === "down") {
    handleHistoryNavigation(rl);
  } else if (key.name === "tab") {
    handleAutoComplete(rl);
  }
});
