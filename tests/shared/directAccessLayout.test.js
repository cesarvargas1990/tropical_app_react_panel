import { describe, expect, it } from "vitest";

import {
  buildDirectAccessGroupLayouts,
  resolveDirectAccessGroupSpan,
} from "../../src/shared/utils/directAccessLayout";

describe("directAccessLayout", () => {
  it("resolves natural spans based on item count", () => {
    expect(resolveDirectAccessGroupSpan(1)).toBe(1);
    expect(resolveDirectAccessGroupSpan(2)).toBe(2);
    expect(resolveDirectAccessGroupSpan(3)).toBe(3);
    expect(resolveDirectAccessGroupSpan(6)).toBe(3);
  });

  it("keeps the final row compact when the last three groups are single cards", () => {
    const layouts = buildDirectAccessGroupLayouts([
      ["Refrescante", [{ id: 1 }, { id: 2 }, { id: 3 }]],
      ["Canada Dry", [{ id: 4 }]],
      ["Corona", [{ id: 5 }]],
      ["Electrolit", [{ id: 6 }]],
      ["Coca Cola", [{ id: 7 }]],
    ]);

    expect(layouts.map(({ groupName, span }) => [groupName, span])).toEqual([
      ["Refrescante", 3],
      ["Canada Dry", 1],
      ["Corona", 1],
      ["Electrolit", 1],
      ["Coca Cola", 1],
    ]);
  });

  it("keeps a balanced final pair when both groups need more width", () => {
    const layouts = buildDirectAccessGroupLayouts([
      ["Refrescante", [{ id: 1 }, { id: 2 }, { id: 3 }]],
      ["Stella", [{ id: 4 }, { id: 5 }]],
      ["Electrolit", [{ id: 6 }, { id: 7 }]],
    ]);

    expect(layouts.map(({ groupName, span }) => [groupName, span])).toEqual([
      ["Refrescante", 3],
      ["Stella", 2],
      ["Electrolit", 1],
    ]);
  });
});
