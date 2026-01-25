import { createInterface } from "readline";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const builtIn: Set<String> = new Set(["echo", "exit", "type"]);

function givePrompt() {
  rl.question("$ ", (command: string) => {
    // split(/s+/) - splits the string into parts wherever there are one or more whitespace characters.
    const commandParts = command.trim().split(/\s+/);
    if (commandParts[0] === "exit") {
      const code = commandParts[1] ? parseInt(commandParts[1], 10) : 0;
      rl.close();
      process.exit(code);
    } else if (commandParts[0] === "echo") {
      console.log(commandParts.slice(1).join(" "));
    } else if (commandParts[0] === "type") {
      const isBuiltIn = commandParts[1] && builtIn.has(commandParts[1]);
      if (isBuiltIn) {
        console.log(`${commandParts[1]} is a shell builtin`);
      } else {
        console.log(`${commandParts[1]}: not found`);
      }
    } else {
      console.log(`${commandParts[0]}: command not found`);
    }
    givePrompt();
  });
}
givePrompt();
