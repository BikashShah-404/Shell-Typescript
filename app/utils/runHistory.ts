export const commandHistory: string[] = [];

export const runHistory = () => {
  for (const index in commandHistory ?? []) {
    console.log(Number(index) + 1, commandHistory[index]);
  }
};
