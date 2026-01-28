import { createInterface } from "readline";
import { runEcho } from "./utils/runEcho";
import { runCustomCommand } from "./utils/handleCustomCommands";
import { runType } from "./utils/runType";
import { runExit } from "./utils/runExit";
import { builtIn } from "./constants";
import { runPwd } from "./utils/runPwd";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

function givePrompt() {
  rl.question("$ ", (command: string) => {
    // split(/s+/) - splits the string into parts wherever there are one or more whitespace characters.
    const commandParts = command.trim().split(/\s+/);

    if (commandParts[0] === "exit") {
      runExit(commandParts, rl);
    } else if (commandParts[0] === "echo") {
      runEcho(commandParts);
    } else if (commandParts[0] === "type") {
      commandParts[1] && runType(commandParts[1]);
    } else if (commandParts[0] === "pwd") {
      runPwd();
    } else {
      const [command, ...args] = commandParts;
      if (command) {
        const childproc = runCustomCommand(command, args);
        childproc.on("close", () => givePrompt());
        return;
      }
    }
    givePrompt();
  });
}
givePrompt();
