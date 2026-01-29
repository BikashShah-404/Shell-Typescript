export const commandHistory: string[] = [];

export const runHistory = (length: number) => {
  if (!length) {
    for (const index in commandHistory ?? []) {
      console.log(Number(index) + 1, commandHistory[index]);
    }
  } else {
    const requiredHistory = commandHistory.slice(-length);
    for (const index in requiredHistory ?? []) {
      console.log(Number(index) + 1, requiredHistory[index]);
    }
  }
};
