import { describe, it, expect } from "vitest";
import { search, type Item } from "./search";

const items: Item[] = [
  { id: "1", name: "Guarda-chuva amarelo", keywords: "sombrinha", tent: "1", spot: "" },
  { id: "2", name: "Chave de fenda", keywords: "ferramenta", tent: "2", spot: "" },
];

describe("search", () => {
  it("ignores accents and case", () => expect(search(items, "GUARDA CHUVA")[0]?.id).toBe("1"));
  it("matches keywords", () => expect(search(items, "sombrinha")[0]?.id).toBe("1"));
  it("ignores articles and plurals", () => expect(search(items, "uma chaves de fenda")[0]?.id).toBe("2"));
  it("requires every word to match", () => expect(search(items, "chave azul")).toHaveLength(0));
});
