import path from "path";
import fs from "fs";

import { paths } from "../constants";

export const checkIfFileForCommandExist = (command: string) => {
  // PATH is now: /tmp/ant:/tmp/pig:/tmp/fox:...
  // this /tmp/ant has "myexe" file but don't have exec permission, whereas /tmp/pig has "myexe" with exec permission but since i was only searching for the first pathForFile, i was missing the another file which had the exec permission , so, i returned an array of pathsForFile and then check for exec perm for each one of them...

  let arrayOfExistingFiles: String[] = [];
  for (let eachPath of paths ?? []) {
    const pathForFile = path.join(eachPath.toString(), command);
    if (fs.existsSync(pathForFile)) {
      arrayOfExistingFiles.push(pathForFile);
    }
  }
  return arrayOfExistingFiles;
};
