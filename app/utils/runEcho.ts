export const runEcho = (commandParts: string[]): void => {
  console.log(commandParts.slice(1).join(" "));
};
