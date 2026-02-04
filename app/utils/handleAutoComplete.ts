import type { Interface } from "node:readline";
import { builtIn, paths } from "../constants";
import { access, opendir } from "node:fs/promises";
import path from "node:path";

class TrieNode {
  children: Map<string, TrieNode>;
  isEndOfWord: boolean;

  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
  }
}

class Trie {
  private root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  insert(word: string): void {
    let current = this.root;
    for (const char of word) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      current = current.children.get(char)!;
    }
    current.isEndOfWord = true;
  }

  search(word: string): boolean {
    let current = this.root;
    for (const char of word) {
      if (!current.children.has(char)) return false;
      current = current.children.get(char)!;
    }
    return current.isEndOfWord;
  }

  collectSuggestions(prefix: string): string[] {
    const suggestions: string[] = [];

    const dfs = (node: TrieNode, path: string) => {
      if (node.isEndOfWord) suggestions.push(path);
      for (const [char, child] of node.children) {
        dfs(child, path + char);
      }
    };

    let current = this.root;
    for (const char of prefix) {
      if (!current.children.has(char)) return [];
      current = current.children.get(char)!;
    }
    dfs(current, prefix);
    return suggestions;
  }
}

// Trie for builtins
const trie = new Trie();
builtIn.forEach((eachBuiltIn) => trie.insert(eachBuiltIn));

// Trie for executable files in Directories in PATH
const execTrie = new Trie();
export const getExecFilesForSuggestions = async () =>
  await Promise.all(
    paths.map(async (envPath) => {
      try {
        const dir = await opendir(envPath);
        for await (const dirent of dir) {
          if (dirent.isFile()) {
            await access(path.join(envPath, dirent.name));
            execTrie.insert(dirent.name);
          }
        }
      } catch (err) {
        return null;
      }
    }),
  );

let tabCount = 0;
export let suggestions: string[] = [];
export let execFileSuggestions: string[] = [];

export const setTabCount = (number: number) => {
  tabCount = number;
};
export const setSuggestions = (data: string[]) => (suggestions = [...data]);
export const setExecFileSuggestions = (data: string[]) =>
  (execFileSuggestions = [...data]);

export const handleAutoComplete = (rl: any) => {
  // Catching what is on the terminal when tab was pressed:
  const typedKeyword = rl.line.trim();

  if (!trie.search(typedKeyword)) {
    suggestions = trie.collectSuggestions(typedKeyword);
    if (!execTrie.search(typedKeyword)) {
      execFileSuggestions = execTrie.collectSuggestions(typedKeyword);
      execFileSuggestions.sort();
    }
  }

  // To prevent the defualt tab behaviour:
  rl.write(null, { ctrl: true, name: "u" });

  if (suggestions.length === 0) {
    // If no built-in suggestion is found
    if (execFileSuggestions.length === 0) {
      // if no execFileSuggestion is found
      rl.write(typedKeyword);
      process.stdout.write("\x07"); //ring a bell - \x07
    } else if (execFileSuggestions.length === 1) {
      // if execFile suggestion is only one just write , don't suggest
      rl.write(`${execFileSuggestions[0]} `);
    } else {
      // if more than one execFileSuggestions , then suggest all on pressing tab twice , ring bell on first tab
      process.stdout.write("\x07");
      rl.write(typedKeyword);
      tabCount++;
      if (tabCount === 2) {
        rl.output.write("\n");
        for (const eachExecFileSuggestion of execFileSuggestions) {
          rl.output.write(`${eachExecFileSuggestion}  `);
        }
        rl.output.write("\n");
        rl._refreshLine();
        tabCount = 0;
      }
    }
    return;
  } else if (suggestions.length === 1) {
    rl.write(`${suggestions[0]} `);
  } else {
    process.stdout.write("\x07");
    rl.write(typedKeyword);
    tabCount++;
    if (tabCount === 2) {
      rl.output.write("\n");
      for (const suggestion of suggestions) {
        rl.output.write(`${suggestion}  `);
      }
      rl.output.write("\n");
      rl._refreshLine();
      tabCount = 0;
      return;
    }
  }
};
