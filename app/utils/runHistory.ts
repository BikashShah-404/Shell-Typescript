import type { Interface } from "readline";

export const commandHistory: string[] = [];

export const runHistory = (length: number) => {
  if (!length) {
    for (const index in commandHistory ?? []) {
      console.log(Number(index) + 1, commandHistory[index]);
    }
  } else {
    commandHistory.map((eachCommand, index) => {
      if (commandHistory.length - index <= length) {
        console.log(Number(index) + 1, eachCommand);
      }
    });
  }
};

let historyIndex = -1;
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
