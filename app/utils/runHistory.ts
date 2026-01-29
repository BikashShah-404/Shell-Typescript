import {
  closeSync,
  existsSync,
  openSync,
  readFileSync,
  writeFileSync,
} from "fs";
import os from "os";
import type { Interface } from "readline";

// export const commandHistory: string[] = [];
// export const commandHistoryFromFile: string[] = [];

// export const runHistory = (args: string[]) => {
//   const optionToFnMapping: Record<string, (...argsForOption: any[]) => void> = {
//     "-r": (fileToRead: string) => {
//       if (!fileToRead) return;
//       try {
//         const data = readFileSync(fileToRead, "utf8");
//         for (const eachLine of data
//           .toString()
//           .trim()
//           .split(os.EOL)
//           .filter(Boolean)) {
//           commandHistory.push(eachLine);
//         }
//         return;
//       } catch (error) {
//         console.error(error);
//       }
//     },
//     "-w": (fileToWrite: string) => {
//       if (commandHistory.length === 0) return;
//       try {
//         writeFileSync(fileToWrite, commandHistory.join("\n") + "\n", {
//           flag: "w",
//         });
//         return;
//       } catch (error) {
//         console.error(error);
//       }
//     },
//     "-a": (fileToAppend: string) => {
//       if (commandHistory.length === 0) return;
//       //   saw people resetting the commandHistory array after every append, i mean that does simplify things,but we lose the top-down navigation for the deleted history(we would have lost them  but clearing owr local cache won’t touch the readline.Interface history. That’s why the idea of “just reset the array” is safe if we only care about your own append logic — the built‑in navigation history remains intact unless you explicitly clear rl.history but let's just imagine that createInterface inbuilt history navigation doesn't exist, then this code is required so i guess i will keep it as it is.
//       try {
//         const latestHistoryAppendOccurence = commandHistory.findLastIndex(
//           (command, index) =>
//             command.startsWith("history -a") &&
//             index !== commandHistory.length - 1,
//         );
//         if (latestHistoryAppendOccurence === -1) {
//           writeFileSync(fileToAppend, commandHistory.join("\n") + "\n", {
//             flag: "a",
//           });
//           return;
//         } else {
//           writeFileSync(
//             fileToAppend,
//             commandHistory
//               .slice(latestHistoryAppendOccurence + 1, commandHistory.length)
//               .join("\n") + "\n",
//             {
//               flag: "a",
//             },
//           );
//           return;
//         }
//       } catch (error) {
//         console.error(error);
//       }
//     },
//   };

//   if (args.length === 0) {
//     commandHistory.forEach((cmd, i) => {
//       console.log(i + 1, cmd);
//     });
//   } else if (args.length === 1 && parseInt(args[0], 10)) {
//     commandHistory.map((eachCommand, index) => {
//       if (commandHistory.length - index <= Number(args[0])) {
//         console.log(Number(index) + 1, eachCommand);
//       }
//     });
//   } else {
//     const fn = optionToFnMapping[args[0]];
//     if (fn) {
//       fn(...args.slice(1));
//     } else {
//       console.error("Unknown option:", args[0]);
//     }
//   }
// };

// export const readHistoryOnStartUp = () => {
//   const pathForHistoryFile = process.env.HISTFILE as string;
//   if (!existsSync(pathForHistoryFile)) {
//     closeSync(openSync(pathForHistoryFile, "a"));
//   } else {
//     runHistory(["-r", pathForHistoryFile]);
//   }
// };

// export const writeHistoryOnExit = () => {
//   const pathForHistoryFile = process.env.HISTFILE as string;
//   runHistory(["-w", pathForHistoryFile]);
// };

// let historyIndex = -1;
// export const setHistoryIndex = (value: number) => {
//   historyIndex = value;
// };

// export const handleHistoryNavigation = (rl: Interface) => {
//   process.stdin.on("keypress", (_, key) => {
//     if (!key) return;

//     // handle up arrow naviagtion
//     if (key.name === "up") {
//       if (commandHistory.length === 0) return;

//       if (historyIndex === -1) {
//         historyIndex = commandHistory.length - 1;
//       } else if (historyIndex > 0) {
//         historyIndex -= 1;
//       }

//       // It clears the current input, whatever was written on terminal before pressing up
//       rl.write(null, { ctrl: true, name: "u" });
//       //   Now we will write the history:
//       rl.write(commandHistory[historyIndex]);
//     }

//     // handle down arrow navigation
//     if (key.name === "down") {
//       if (historyIndex === -1) return;

//       historyIndex++;

//       if (historyIndex >= commandHistory.length) {
//         historyIndex = -1;
//         rl.write(null, { ctrl: true, name: "u" });
//         return;
//       }

//       rl.write(null, { ctrl: true, name: "u" });
//       rl.write(commandHistory[historyIndex]);
//     }
//   });
// };

export const commandHistory: string[] = [];
export const commandHistoryFromFile: string[] = [];

export const runHistory = (args: string[]) => {
  const optionToFnMapping: Record<string, (...argsForOption: any[]) => void> = {
    "-r": (fileToRead: string) => {
      if (!fileToRead) return;
      try {
        const data = readFileSync(fileToRead, "utf8");
        if (fileToRead === process.env.HISTFILE) {
          for (const eachLine of data
            .toString()
            .trim()
            .split(os.EOL)
            .filter(Boolean)) {
            commandHistoryFromFile.push(eachLine);
          }
        } else {
          for (const eachLine of data
            .toString()
            .trim()
            .split(os.EOL)
            .filter(Boolean)) {
            commandHistory.push(eachLine);
          }
        }
        return;
      } catch (error) {
        console.error(error);
      }
    },
    "-w": (fileToWrite: string) => {
      const historyArray = [...commandHistoryFromFile, ...commandHistory];
      if (historyArray.length === 0) return;
      try {
        writeFileSync(fileToWrite, historyArray.join("\n") + "\n", {
          flag: "w",
        });
        return;
      } catch (error) {
        console.error(error);
      }
    },
    "-a": (fileToAppend: string) => {
      if (commandHistory.length === 0) return;
      //   saw people resetting the commandHistory array after every append, i mean that does simplify things,but we lose the top-down navigation for the deleted history(we would have lost them  but clearing owr local cache won’t touch the readline.Interface history. That’s why the idea of “just reset the array” is safe if we only care about your own append logic — the built‑in navigation history remains intact unless you explicitly clear rl.history but let's just imagine that createInterface inbuilt history navigation doesn't exist, then this code is required so i guess i will keep it as it is.
      try {
        const latestHistoryAppendOccurence = commandHistory.findLastIndex(
          (command, index) =>
            command.startsWith("history -a") &&
            index !== commandHistory.length - 1,
        );
        if (latestHistoryAppendOccurence === -1) {
          writeFileSync(fileToAppend, commandHistory.join("\n") + "\n", {
            flag: "a",
          });
          return;
        } else {
          writeFileSync(
            fileToAppend,
            commandHistory
              .slice(latestHistoryAppendOccurence + 1, commandHistory.length)
              .join("\n") + "\n",
            {
              flag: "a",
            },
          );
          return;
        }
      } catch (error) {
        console.error(error);
      }
    },
  };

  if (args.length === 0) {
    [...commandHistoryFromFile, ...commandHistory].forEach((cmd, i) => {
      console.log(i + 1, cmd);
    });
  } else if (args.length === 1 && parseInt(args[0], 10)) {
    [...commandHistoryFromFile, ...commandHistory].map((eachCommand, index) => {
      if (
        [...commandHistoryFromFile, ...commandHistory].length - index <=
        Number(args[0])
      ) {
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

export const readHistoryOnStartUp = () => {
  const pathForHistoryFile = process.env.HISTFILE as string;
  if (!existsSync(pathForHistoryFile)) {
    closeSync(openSync(pathForHistoryFile, "a"));
  } else {
    runHistory(["-r", pathForHistoryFile]);
  }
};

export const writeHistoryOnExit = () => {
  const pathForHistoryFile = process.env.HISTFILE as string;
  runHistory(["-w", pathForHistoryFile]);
};

let historyIndex = -1;
export const setHistoryIndex = (value: number) => {
  historyIndex = value;
};

export const handleHistoryNavigation = (rl: Interface) => {
  process.stdin.on("keypress", (_, key) => {
    if (!key) return;

    const historyArray = [...commandHistoryFromFile, ...commandHistory];
    // handle up arrow naviagtion
    if (key.name === "up") {
      if (historyArray.length === 0) return;

      if (historyIndex === -1) {
        historyIndex = historyArray.length - 1;
      } else if (historyIndex > 0) {
        historyIndex -= 1;
      }

      // It clears the current input, whatever was written on terminal before pressing up
      rl.write(null, { ctrl: true, name: "u" });
      //   Now we will write the history:
      rl.write(historyArray[historyIndex]);
    }

    // handle down arrow navigation
    if (key.name === "down") {
      if (historyIndex === -1) return;

      historyIndex++;

      if (historyIndex >= historyArray.length) {
        historyIndex = -1;
        rl.write(null, { ctrl: true, name: "u" });
        return;
      }

      rl.write(null, { ctrl: true, name: "u" });
      rl.write(historyArray[historyIndex]);
    }
  });
};
