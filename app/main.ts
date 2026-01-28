import path from "path";
import fs from "fs";
import { createInterface } from "readline";
import { ChildProcess, execFileSync, spawn } from "child_process";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const builtIn: Set<String> = new Set(["echo", "exit", "type"]);
const paths: String[] = process?.env?.PATH?.split(path.delimiter) ?? [];

const checkIfFileForCommandExist = (command: string) => {
  let arrayOfExistingFiles: String[] = [];
  for (let eachPath of paths ?? []) {
    const pathForFile = path.join(eachPath.toString(), command);
    if (fs.existsSync(pathForFile)) {
      arrayOfExistingFiles.push(pathForFile);
    }
  }
  return arrayOfExistingFiles;
};

const checkForExecPermission = (filePath: string) => {
  try {
    fs.accessSync(filePath, fs.constants.X_OK);
    return true;
  } catch {
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
    const pathsForFile = checkIfFileForCommandExist(typeArgument);

    if (pathsForFile.length > 0) {
      const pathForFileWithExecPerm = pathsForFile.find((pathForFile) =>
        checkForExecPermission(pathForFile.toString()),
      );
      if (pathForFileWithExecPerm) {
        console.log(`${typeArgument} is ${pathForFileWithExecPerm}`);
      } else {
        // do nothing if file exist and doesn't have exec permission.
      }
    }
    if (pathsForFile.length === 0) console.log(`${typeArgument}: not found`);
  }
};

const runCustomCommand = (command: string, args: String[]): ChildProcess => {
  const pathsForFile = checkIfFileForCommandExist(command);

  if (pathsForFile.length > 0) {
    const pathForFileWithExecPerm = pathsForFile.find((pathForFile) =>
      checkForExecPermission(pathForFile.toString()),
    );
    if (pathForFileWithExecPerm) {
      const proc = spawn(
        path.basename(pathForFileWithExecPerm.toString()),
        args.map((eachArg) => eachArg.toString()),
        { stdio: "inherit" },
      );
      proc.stdout?.on("data", (data) => {});
      return proc;
    } else {
      //if file exist and doesn't have exec permission.
      return spawn("echo", [`${command}: don't have exec permission`], {
        stdio: "inherit",
      });
    }
  } else {
    return spawn("echo", [`${path.basename(command)}: command not found`], {
      stdio: "inherit",
    });
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
      const childproc = runCustomCommand(command, args);
      childproc.on("close", () => givePrompt());
      return;
    }
    givePrompt();
  });
}
givePrompt();
