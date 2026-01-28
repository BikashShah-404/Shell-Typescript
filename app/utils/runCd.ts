import { statSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

export const runCd = (dirToGo: string) => {
  try {
    if (dirToGo.startsWith("~")) {
      const [home, ...restofPath] = dirToGo.split(path.sep);
      dirToGo = path.join(homedir(), restofPath.join(path.sep));
    }
    process.chdir(dirToGo);
  } catch (error) {
    console.log(`cd: ${dirToGo}: No such file or directory`);
  }
};
