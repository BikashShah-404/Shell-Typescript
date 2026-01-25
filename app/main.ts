import { createInterface } from "readline";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

function givePrompt() {
  rl.question("$ ", (command) => {
    if (command === "exit") {
      rl.close();
      process.exit(0);
    } else if (command.startsWith("echo ")) {
      console.log(
        command
          .split(" ")
          .filter((eachCommand, index) => index !== 0)
          .join(" "),
      );
    } else {
      console.log(`${command}: command not found`);
    }
    givePrompt();
  });
}
givePrompt();
