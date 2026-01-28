import { statSync } from "node:fs";

export const runCd = (dirToGo: string) => {
  try {
    const doesDirExist = statSync(dirToGo).isDirectory();
    if (doesDirExist) process.chdir(dirToGo);
  } catch (error) {
    console.log(`cd: ${dirToGo}: No such file or directory`);
  }
};
