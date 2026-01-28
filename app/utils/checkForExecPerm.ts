import fs from "fs";

export const checkForExecPermission = (filePath: string) => {
  try {
    fs.accessSync(filePath, fs.constants.X_OK);
    return true;
  } catch {
    return false;
  }
};
