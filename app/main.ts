import { createInterface } from "readline";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

function givePrompt() {
  rl.question("$ ", (command) => {
    if (command === "exit") {
      rl.close();
    } else {
      console.log(`${command}: command not found`);
      givePrompt();
    }
  });
}
givePrompt();
