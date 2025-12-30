import { useCallback, useMemo, useState } from "react"
import { buildCartItems, buildEditSizeState } from "../utils/cartBuilder"

let sharedAudioCtx = null

export function useCartFlow({ originalProducts, matrix, getSizesFor, products }) {
  const [sizes, setSizes] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [sizeState, setSizeState] = useState({})
  const [cartItems, setCartItems] = useState([])
  const [editIndex, setEditIndex] = useState(null)
  const [editSourceIndices, setEditSourceIndices] = useState([])
  const playBeep = useCallback(() => {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return

    try {
      if (!sharedAudioCtx || sharedAudioCtx.state === "closed") {
        sharedAudioCtx = new AudioCtx()
      }

      const ctx = sharedAudioCtx
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {})
      }

      const osc = ctx.createOscillator()
      const gainNode = ctx.createGain()
      const now = ctx.currentTime

      osc.type = "square"
      osc.frequency.setValueAtTime(1500, now)

      gainNode.gain.setValueAtTime(0.001, now)
      gainNode.gain.exponentialRampToValueAtTime(0.12, now + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12)

      osc.connect(gainNode)
      gainNode.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.15)
    } catch (e) {
      console.warn("No se pudo reproducir beep123", e)
    }
  }, [])

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  )

  const groupKey = useCallback((item) => {
    return JSON.stringify({
      productName: item.productName,
      size: item.size,
      sizeLabel: item.sizeLabel,
      unitPrice: item.unitPrice,
      toppings: item.toppings,
      delivery: item.delivery,
    })
  }, [])

  const groupedItems = useMemo(() => {
    const map = new Map()
    cartItems.forEach((item, idx) => {
      const key = groupKey(item)
      if (!map.has(key)) {
        map.set(key, {
          ...item,
          sourceIndices: [idx],
          sourceIndex: idx,
        })
      } else {
        const current = map.get(key)
        current.quantity += item.quantity
        current.subtotal += item.subtotal
        current.sourceIndices.push(idx)
      }
    })
    return Array.from(map.values())
  }, [cartItems, groupKey])

  const selectProduct = useCallback((product) => {
    setSelectedProduct(product)
    setSizes(getSizesFor(product))
    setSizeState({})
  }, [getSizesFor])

  const updateSize = useCallback((id, data) => {
    setSizeState((prev) => ({ ...prev, [id]: data }))
  }, [])

  const confirmSizes = useCallback(() => {
    const newItems = buildCartItems({
      sizes,
      sizeState,
      selectedProduct,
      originalProducts,
      matrix,
    })

    if (!newItems.length) return

    if (editIndex !== null) {
      setCartItems((prev) => {
        const indices = (editSourceIndices.length ? editSourceIndices : [editIndex]).filter(
          (i) => i !== null && i !== undefined
        )
        if (!indices.length) return prev

        const primary = Math.min(...indices)
        const rest = indices.filter((i) => i !== primary).sort((a, b) => b - a)

        const copy = [...prev]
        rest.forEach((i) => copy.splice(i, 1))
        copy[primary] = newItems[0]
        return copy
      })
      setEditIndex(null)
      setEditSourceIndices([])
    } else {
      setCartItems((prev) => [...prev, ...newItems])
    }

    setSelectedProduct(null)
    setSizeState({})
  }, [sizes, sizeState, selectedProduct, originalProducts, matrix, editIndex, playBeep])

  const removeCartItem = useCallback((index) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const clearCart = useCallback(() => setCartItems([]), [])

  const removeGroup = useCallback((item) => {
    const key = groupKey(item)
    setCartItems((prev) => prev.filter((i) => groupKey(i) !== key))
  }, [groupKey])

  const startEditItem = useCallback((item, index) => {
    const baseName = item.productName?.split(' (')[0] ?? item.productName
    const product = products.find((p) => p.name === baseName)
    if (!product) return { ok: false }

    setSelectedProduct(product)
    const indices = item?.sourceIndices?.length ? item.sourceIndices : [index]
    setEditIndex(indices[0] ?? null)
    setEditSourceIndices(indices.filter((i) => i !== null && i !== undefined))
    setSizes(getSizesFor(product))
    setSizeState(buildEditSizeState(item))

    return { ok: true }
  }, [getSizesFor, products])

  const finishEditCancel = useCallback(() => {
    setSelectedProduct(null)
    setEditIndex(null)
    setEditSourceIndices([])
  }, [])

  const addItemDirect = useCallback((product, { fromSocket = false } = {}) => {
    if (!product) return false

    const characteristic =
      product.caracteristica ??
      product.caracteristica_nombre ??
      product.feature ??
      ""

    const productName = characteristic
      ? `${product.sabor ?? product.name ?? "Producto"} (${characteristic})`
      : product.sabor ?? product.name ?? "Producto"

    const item = {
      productName,
      size: product.tamano_id ?? product.tamanoId ?? product.tamano_id ?? null,
      sizeLabel: product.tamano ?? product.sizeLabel ?? "",
      quantity: 1,
      unitPrice: Number(product.valor ?? 0),
      toppings: 0,
      delivery: 0,
      subtotal: Number(product.valor ?? 0),
      machineId: product.machineId ?? null,
      maquinaConfId: product.maquinaConfId ?? product.maquina_conf_id ?? null,
      productMatrixId: product.productMatrixId ?? product.id ?? null,
    }

    setCartItems((prev) => [...prev, item])
    if (fromSocket) playBeep()
    return true
  }, [playBeep])

  return {
    // state
    sizes,
    selectedProduct,
    sizeState,
    cartItems,
    editIndex,
    editSourceIndices,
    cartCount,

    // setters/handlers
    setSizes,
    setSelectedProduct,
    setSizeState,
    setCartItems,
    setEditIndex,
    setEditSourceIndices,

    selectProduct,
    updateSize,
    confirmSizes,
    removeCartItem,
    clearCart,
    removeGroup,
    startEditItem,
    finishEditCancel,
    addItemDirect,
    groupedItems,
  }
}
