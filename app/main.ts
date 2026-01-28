import path from "path";
import fs from "fs";
import { createInterface } from "readline";
import { execFileSync } from "child_process";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const builtIn: Set<String> = new Set(["echo", "exit", "type"]);
const paths: String[] | undefined = process.env.PATH?.split(path.delimiter);

const checkIfFileForCommandExist = (command: string) => {
  for (let eachPath of paths ?? []) {
    const pathForFile = path.join(eachPath.toString(), command);
    if (fs.existsSync(pathForFile)) {
      return pathForFile;
    }
  }
  return null;
};

const checkForExecPermission = (filePath: string) => {
  try {
    fs.accessSync(filePath, fs.constants.X_OK);
    return true;
  } catch (err) {
    return false;
  }
};

const runEcho = (commandParts: string[]): void => {
  console.log(commandParts.slice(1).join(" "));
};

const handleBuiltIn = (commandToCheck: string): boolean => {
  const isBuiltIn = builtIn.has(commandToCheck);
  if (isBuiltIn) {
    console.log(`${commandToCheck} is a shell builtin`);
  }
  return isBuiltIn;
};

const runType = (typeArgument: string) => {
  const isBuiltIn = handleBuiltIn(typeArgument);
  if (!isBuiltIn) {
    const pathForFile = checkIfFileForCommandExist(typeArgument);
    if (pathForFile) {
      const hasExecPermission = checkForExecPermission(pathForFile);
      if (hasExecPermission) {
        console.log(`${typeArgument} is ${pathForFile}`);
      } else {
        // do nothing if file exist and doesn't have exec permission.
      }
    }
    if (!pathForFile) console.log(`${typeArgument}: not found`);
  }
};

const runCustomCommand = (command: string, args: String[]) => {
  const pathForFile = checkIfFileForCommandExist(command);

  if (pathForFile) {
    const hasExecPermission = checkForExecPermission(pathForFile);
    if (hasExecPermission) {
      try {
        const stdout = execFileSync(
          pathForFile,
          args.map((eachArg) => eachArg.toString()),
        );
        console.log(stdout);
        return true;
      } catch (error) {
        return false;
      }
    } else {
      //if file exist and doesn't have exec permission.
      return false;
    }
  } else {
    return false;
  }
};

function givePrompt() {
  rl.question("$ ", (command: string) => {
    // split(/s+/) - splits the string into parts wherever there are one or more whitespace characters.
    const commandParts = command.trim().split(/\s+/);

    if (commandParts[0] === "exit") {
      const code = commandParts[1] ? parseInt(commandParts[1], 10) : 0;
      rl.close();
      process.exit(code);
    } else if (commandParts[0] === "echo") {
      runEcho(commandParts);
    } else if (commandParts[0] === "type") {
      commandParts[1] && runType(commandParts[1]);
    } else {
      const [command, ...args] = commandParts;
      const didCustomCommandRun = runCustomCommand(command, args);
      if (!didCustomCommandRun) {
        console.log(`${commandParts[0]}: command not found`);
      }
      givePrompt();
    }
  });
}
givePrompt();
