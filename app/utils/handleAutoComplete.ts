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

const trie = new Trie();
builtIn.forEach((eachBuiltIn) => trie.insert(eachBuiltIn));

paths.map(async (envPath) => {
  try {
    const dir = await opendir(envPath, { recursive: true });
    for await (const dirent of dir) {
      if (dirent.isFile()) {
        await access(path.join(dirent.parentPath, dirent.name));
        trie.insert(dirent.name);
      }
    }
  } catch (err) {
    return null;
  }
});

let suggestionsIndex = 0;

export let suggestions: string[] = [];
export const setSuggestions = (data: string[]) => (suggestions = [...data]);

export const handleAutoComplete = (rl: Interface) => {
  // Catching what is on the terminal when tab was pressed:
  const typedKeyword = rl.line.trim();

  if (!trie.search(typedKeyword)) {
    suggestions = trie.collectSuggestions(typedKeyword);
    suggestionsIndex = 0;
  }

  // To prevent the defualt tab behaviour:
  rl.write(null, { ctrl: true, name: "u" });

  if (suggestions.length === 0) {
    rl.write(typedKeyword);
    process.stdout.write("\x07"); //ring a bell - \x07
    return;
  }

  rl.write(`${suggestions[suggestionsIndex]} `);
  suggestionsIndex = (suggestionsIndex + 1) % suggestions.length;
  return;
};
