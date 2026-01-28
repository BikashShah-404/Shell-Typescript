import path from "path";
import { ChildProcess, spawn } from "child_process";

import { checkForExecPermission } from "./checkForExecPerm.ts";
import { checkIfFileForCommandExist } from "./checkIfFIleExists.ts";

export const runCustomCommand = (
  command: string,
  args: String[],
): ChildProcess => {
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
      return proc;
    } else {
      //if file exist and doesn't have exec permission.
      return spawn("echo", [`${command}: don't have exec permission`], {
        shell: true,
        stdio: "inherit",
      });
    }
  } else {
    return spawn("echo", [`${command}: command not found`], {
      shell: true,
      stdio: "inherit",
    });
  }
};
