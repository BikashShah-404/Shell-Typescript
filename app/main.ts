import { createInterface } from "readline";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("$ ", (answer) => {
  rl.write(`${answer} : Command not found`);
  rl.close();
});
