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
import {
  execFileSuggestions,
  getExecFilesForSuggestions,
  handleAutoComplete,
  setExecFileSuggestions,
  setSuggestions,
  setTabCount,
  suggestions,
} from "./utils/handleAutoComplete.ts";

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
getExecFilesForSuggestions();

function parseArgs(input: string): string[] | [] {
  const regex = /'([^']*)'|"([^"]*)"|[^\s'"]+/g;
  const args: string[] = [];
  let match: RegExpExecArray | null;
  let prevMatchIndex = 0;

  while ((match = regex.exec(input)) !== null) {
    let token = match[0];
    console.log("token", match, token);

    prevMatchIndex = prevMatchIndex + token.length;

    if (
      (token.startsWith("'") && token.endsWith("'")) ||
      (token.startsWith('"') && token.endsWith('"'))
    ) {
      token = token.slice(1, -1);
      console.log("afterSllice", token);
    }

    console.log(prevMatchIndex);

    console.log("uikagvdkjsb", match.index - prevMatchIndex);
    if (match.index - prevMatchIndex === 1) {
      console.log("next to each other");
    }

    // let singlequoteCount = 0;
    // let doublequoteCount = 0;
    // for (const char of token) {
    //   if (char === "\\") {
    //     token = token.replace("\\", "");
    //     continue;
    //   }
    //   if (char === "'") singlequoteCount++;
    //   if (char === '"') doublequoteCount++;
    //   if (singlequoteCount === 2) {
    //     for (let i = 1; i <= 2; i++) {
    //       token = token.replace("'", "");
    //     }
    //     singlequoteCount = 0;
    //   }
    //   if (doublequoteCount === 2) {
    //     console.log(doublequoteCount);

    //     for (let i = 1; i <= 2; i++) {
    //       token = token.replace('"', "");
    //       console.log(token);
    //     }
    //     doublequoteCount = 0;
    //   }
    // }

    args.push(token);
  }

  // console.log(input.replaceAll());
  return args;
}

rl.on("line", (command: string) => {
  // split(/s+/) - splits the string into parts wherever there are one or more whitespace characters.
  if (
    command.trim() &&
    commandHistory[commandHistory.length - 1] !== command.trim()
  ) {
    commandHistory.push(command.trim());
  }
  setHistoryIndex(-1);

  const [cmd, ...args] = parseArgs(command.trim());
  console.log(args);

  if (cmd === "exit") {
    runExit(args, rl);
    return;
  } else if (cmd === "echo") {
    runEcho(args);
  } else if (cmd === "type") {
    args[0] && runType(args[0]);
  } else if (cmd === "pwd") {
    runPwd();
  } else if (cmd === "cd") {
    runCd(args[0]);
  } else if (cmd === "history") {
    if (cmd) {
      runHistory(args);
    }
  } else {
    if (cmd) {
      const childproc = runCustomCommand(cmd, args);
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
    handleHistoryNavigation(rl, key.name);
  } else if (key.name === "tab") {
    handleAutoComplete(rl);
  } else {
    if (suggestions.length > 0) setSuggestions([]);
    if (execFileSuggestions.length > 0) setExecFileSuggestions([]);
    setTabCount(0);
  }
});
