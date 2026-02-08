import { describe, it, expect } from "vitest"
import { formatMoney } from "../../../src/features/cart/components/SizeModal/utils"

describe("SizeModal utils", () => {
  it("formatea moneda en COP", () => {
    const result = formatMoney(12000)
    expect(result).toContain("12.000")
  })
})
