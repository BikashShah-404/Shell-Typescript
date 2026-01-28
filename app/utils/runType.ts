import { checkForExecPermission } from "./checkForExecPerm";
import { checkIfFileForCommandExist } from "./checkIfFIleExists";

import { builtIn } from "../constants";

const handleBuiltIn = (commandToCheck: string): boolean => {
  const isBuiltIn = builtIn.has(commandToCheck);
  if (isBuiltIn) {
    console.log(`${commandToCheck} is a shell builtin`);
  }
  return isBuiltIn;
};

export const runType = (typeArgument: string) => {
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
