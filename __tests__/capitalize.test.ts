
import { capitalize } from "../components/utils/capitalize";
import { describe, test, expect } from "@jest/globals"; // ✔️ Přidán import pro Jest


describe("capitalize", () => {
  test("Převede první písmeno na velké", () => {
    expect(capitalize("hello")).toBe("Hello");
    expect(capitalize("world")).toBe("World");
  });

  test("Vrací prázdný řetězec, pokud je vstup prázdný", () => {
    expect(capitalize("")).toBe("");
  });

  test("Nemění velká písmena ve zbytku slova", () => {
    expect(capitalize("tEST")).toBe("TEST");
  });
});
