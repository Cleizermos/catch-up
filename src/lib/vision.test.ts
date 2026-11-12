import { describe, expect, it } from "vitest";
import { colorName } from "./vision";
describe("colorName", () => {
  it("red", () => expect(colorName(220, 30, 30)).toBe("vermelho"));
  it("blue", () => expect(colorName(30, 60, 200)).toBe("azul"));
  it("white", () => expect(colorName(245, 245, 245)).toBe("branco"));
  it("black", () => expect(colorName(10, 10, 10)).toBe("preto"));
});
