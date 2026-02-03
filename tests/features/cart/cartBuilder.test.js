import { describe, it, expect } from "vitest"
import { buildCartItems, buildEditSizeState } from '../../../src/features/cart/utils/cartBuilder'

describe("cartBuilder", () => {
  describe("buildCartItems", () => {
    it("retorna [] si no hay selectedProduct", () => {
      const res = buildCartItems({
        sizes: [{ id: 1, nombre: "S", basePrice: 1000, delivery: 0, carac_id: 10 }],
        sizeState: { 1: { quantity: 1, toppings: 0, delivery: false } },
        selectedProduct: null,
        originalProducts: [],
        matrix: {},
      })
      expect(res).toEqual([])
    })

    it("retorna [] si no hay items seleccionados (qty <= 0)", () => {
      const res = buildCartItems({
        sizes: [{ id: 1, nombre: "S", basePrice: 1000, delivery: 0, carac_id: 10 }],
        sizeState: { 1: { quantity: 0, toppings: 0, delivery: false } },
        selectedProduct: { name: "Fresa", sabor_id: 1, carac_id: 10 },
        originalProducts: [],
        matrix: {},
      })
      expect(res).toEqual([])
    })

    it("calcula subtotal con quantity (sin items[])", () => {
      // q=2, unit=1000, toppings=200, delivery=true con deliveryPrice=300 => subtotal=2*(1000+200+300)=3000
      const res = buildCartItems({
        sizes: [{ id: 1, nombre: "S", basePrice: 9999, delivery: 0, carac_id: 10 }],
        sizeState: { 1: { quantity: 2, toppings: 200, delivery: true } },
        selectedProduct: { name: "Fresa", sabor_id: 1, carac_id: 10 },
        originalProducts: [
          { sabor_id: 1, carac_id: 10, tamano_id: 1, machineId: 77, maquinaConfId: 88, productMatrixId: 99 },
        ],
        matrix: {
          "1-10-1": { valor: 1000, delivery: 300 },
        },
      })

      expect(res).toHaveLength(1)
      expect(res[0]).toMatchObject({
        productName: "Fresa",
        size: 1,
        sizeLabel: "S",
        quantity: 2,
        unitPrice: 1000,
        toppings: 400, // q * 200
        delivery: 600, // q * 300
        subtotal: 3000,
        machineId: 77,
        maquinaConfId: 88,
        productMatrixId: 99,
      })
    })

    it("calcula subtotal usando items[] (uno por unidad)", () => {
      // 3 unidades:
      // row1 toppings=100 delivery=true => 1000+100+300=1400
      // row2 toppings=0   delivery=false=> 1000+0+0=1000
      // row3 toppings=50  delivery=true => 1000+50+300=1350
      // subtotal=3750, toppingsTotal=150, deliveryTotal=600
      const res = buildCartItems({
        sizes: [{ id: 2, nombre: "M", basePrice: 1000, delivery: 300, carac_id: 10 }],
        sizeState: {
          2: {
            quantity: 3, // (se ignora para subtotal porque hay items[])
            items: [
              { toppings: 100, delivery: true },
              { toppings: 0, delivery: false },
              { toppings: 50, delivery: true },
            ],
          },
        },
        selectedProduct: { name: "Mango", sabor_id: 1, carac_id: 10 },
        originalProducts: [
          { sabor_id: 1, carac_id: 10, tamano_id: 2, machineId: 1, maquinaConfId: 2, productMatrixId: 3 },
        ],
        matrix: {
          "1-10-2": { valor: 1000, delivery: 300 },
        },
      })

      expect(res).toHaveLength(1)
      expect(res[0].quantity).toBe(3) // state.items.length
      expect(res[0].toppings).toBe(150)
      expect(res[0].delivery).toBe(600)
      expect(res[0].subtotal).toBe(3750)
    })

    it("si no hay match en originalProducts, pone ids en null", () => {
      const res = buildCartItems({
        sizes: [{ id: 1, nombre: "S", basePrice: 1000, delivery: 0, carac_id: 10 }],
        sizeState: { 1: { quantity: 1, toppings: 0, delivery: false } },
        selectedProduct: { name: "Fresa", sabor_id: 999, carac_id: 10 },
        originalProducts: [], // sin match
        matrix: { "999-10-1": { valor: 1000, delivery: 0 } },
      })

      expect(res).toHaveLength(1)
      expect(res[0].machineId).toBeNull()
      expect(res[0].maquinaConfId).toBeNull()
      expect(res[0].productMatrixId).toBeNull()
    })

    it("usa fallback de basePrice/delivery del size si matrix no tiene la key", () => {
      const res = buildCartItems({
        sizes: [{ id: 1, nombre: "S", basePrice: 1234, delivery: 55, carac_id: 10 }],
        sizeState: { 1: { quantity: 2, toppings: 10, delivery: true } },
        selectedProduct: { name: "Fresa", sabor_id: 1, carac_id: 10 },
        originalProducts: [],
        matrix: {}, // no key
      })

      // subtotal = 2*(1234+10+55)=2*1299=2598
      expect(res[0].unitPrice).toBe(1234)
      expect(res[0].subtotal).toBe(2598)
      expect(res[0].delivery).toBe(110)
      expect(res[0].toppings).toBe(20)
    })
  })

  describe("buildEditSizeState", () => {
    it("construye state de edición igual al original", () => {
      const item = {
        size: 5,
        quantity: 3,
        toppings: 200,
        delivery: 900, // > 0 => true
      }

      const st = buildEditSizeState(item)

      expect(st.__activeSizeId).toBe(5)
      expect(st[5].quantity).toBe(3)
      expect(st[5].toppings).toBe(200)
      expect(st[5].delivery).toBe(true)
      expect(st[5].items).toHaveLength(3)
      expect(st[5].items[0]).toEqual({ toppings: 200, delivery: true })
    })

    it("delivery=false cuando item.delivery = 0", () => {
      const st = buildEditSizeState({ size: 1, quantity: 1, toppings: 0, delivery: 0 })
      expect(st[1].delivery).toBe(false)
      expect(st[1].items[0].delivery).toBe(false)
    })
  })
})
