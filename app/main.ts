import path from "path";
import fs from "fs";
import { createInterface } from "readline";
import { execFile } from "child_process";

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

// const checkExecFileExistAndPerm = (filename: string): boolean | undefined => {
//   // some will return true as soon as it finds the file with the exec permission and doesn't check other paths , well that's how the path search for executable commands works.
//   const isThereAnyExecFile = paths?.some((eachPath) => {
//     // path.join() basically concats the parts of path as per the operating sysytem
//     const pathForFile = path.join(eachPath.toString(), filename);

//     // fs.existsSync() will synchronously check if the file exists.
//     const doesFileForCommandExist = fs.existsSync(pathForFile);
//     if (doesFileForCommandExist) {
//       try {
//         // fs.accessSync() will syncronously check if the file has exec permission
//         fs.accessSync(pathForFile, fs.constants.X_OK);
//         console.log(`${filename} is ${pathForFile}`);
//         return true;
//       } catch (err) {
//         // if the file doesn't have exec permission, the fs.accessSync() returns error which will be catched here offcourse.
//         // skip, do nothing
//       }
//     } else {
//       return false;
//     }
//   });
//   // if after searching the entire path , no file was found then:

//   return isThereAnyExecFile;
// };

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
      execFile(
        pathForFile,
        [command.toString(), ...args.map((eachArg) => eachArg.toString())],
        (error, stdout, stderr) => {
          console.log(stdout);
        },
      );
      return true;
    } else {
      // do nothing if file exist and doesn't have exec permission.
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
      runCustomCommand(command, args);
      if (!runCustomCommand)
        console.log(`${commandParts[0]}: command not found`);
    }
    givePrompt();
  });
}
givePrompt();
