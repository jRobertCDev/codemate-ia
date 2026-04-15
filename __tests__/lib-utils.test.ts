import { describe, expect, it } from "vitest";
import { truncateText } from "@/lib/utils";

describe("truncateText", () => {
  it("devuelve el texto original si no supera el máximo", () => {
    expect(truncateText("Hola", 10)).toBe("Hola");
  });

  it("devuelve el texto original si tiene exactamente el máximo", () => {
    expect(truncateText("Hola", 4)).toBe("Hola");
  });

  it('recorta el texto y agrega "..." al final', () => {
    expect(truncateText("Hola mundo", 4)).toBe("Hola...");
  });

  it("permite recortar a cero caracteres", () => {
    expect(truncateText("Hola", 0)).toBe("...");
  });

  it("lanza error si maxLength es negativo", () => {
    expect(() => truncateText("Hola", -1)).toThrowError(
      "maxLength must be greater than or equal to 0",
    );
  });
});
