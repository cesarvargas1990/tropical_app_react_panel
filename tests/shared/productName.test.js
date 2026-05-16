import { describe, expect, it } from "vitest";

import { parseProductNameParts } from "../../src/shared/utils/productName";

describe("parseProductNameParts", () => {
  it("returns empty parts for blank values", () => {
    expect(parseProductNameParts(null)).toEqual({ flavor: "", feature: "" });
    expect(parseProductNameParts("   ")).toEqual({ flavor: "", feature: "" });
  });

  it("uses the full name as flavor when there is no complete feature suffix", () => {
    expect(parseProductNameParts("Mango")).toEqual({
      flavor: "Mango",
      feature: "",
    });
    expect(parseProductNameParts("Mango (Especial")).toEqual({
      flavor: "Mango (Especial",
      feature: "",
    });
  });

  it("splits flavor and feature from parenthesized names", () => {
    expect(parseProductNameParts(" Mango  ( Especial ) ")).toEqual({
      flavor: "Mango",
      feature: "Especial",
    });
  });
});
