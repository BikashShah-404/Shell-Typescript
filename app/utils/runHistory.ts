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
