import { readFileSync } from "fs";
import type { Interface } from "readline";

export const commandHistory: string[] = [];

export const runHistory = (args: string[]) => {
  const optionToFnMapping: Record<string, (...argsForOption: any[]) => void> = {
    "-r": (fileToRead: string) => {
      if (!fileToRead) return;
      try {
          const data=readFileSync(fileToRead,'utf8')
          for (const eachLine of data.toString().trim().split("\n")) {
              commandHistory.push(eachLine);
            }
        } catch (error) {
          console.error(error);
          
        }
      }
    },
  };

  console.log(args);

  if (args.length === 0) {
    commandHistory.forEach((cmd, i) => {
      console.log(i + 1, cmd);
    });
  } else if (args.length === 1 && parseInt(args[0], 10)) {
    commandHistory.map((eachCommand, index) => {
      if (commandHistory.length - index <= Number(args[0])) {
        console.log(Number(index) + 1, eachCommand);
      }
    });
  } else {
    const fn = optionToFnMapping[args[0]];
    if (fn) {
      fn(...args.slice(1));
    } else {
      console.error("Unknown option:", args[0]);
    }
  }
};

let historyIndex = -1;
export const setHistoryIndex = (value: number) => {
  historyIndex = value;
};

export const handleHistoryNavigation = (rl: Interface) => {
  process.stdin.on("keypress", (_, key) => {
    if (!key) return;

    // handle up arrow naviagtion
    if (key.name === "up") {
      if (commandHistory.length === 0) return;

      if (historyIndex === -1) {
        historyIndex = commandHistory.length - 1;
      } else if (historyIndex > 0) {
        historyIndex -= 1;
      }

      // It clears the current input, whatever was written on terminal before pressing up
      rl.write(null, { ctrl: true, name: "u" });
      //   Now we will write the history:
      rl.write(commandHistory[historyIndex]);
    }

    // handle down arrow navigation
    if (key.name === "down") {
      if (historyIndex === -1) return;

      historyIndex++;

      if (historyIndex >= commandHistory.length) {
        historyIndex = -1;
        rl.write(null, { ctrl: true, name: "u" });
        return;
      }

      rl.write(null, { ctrl: true, name: "u" });
      rl.write(commandHistory[historyIndex]);
    }
  });
};
