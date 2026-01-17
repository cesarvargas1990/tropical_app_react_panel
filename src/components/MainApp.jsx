import React, { useCallback, useEffect, useState } from "react"

// Servicios
import { getProducts } from "../services/productsService"
import { registerSale } from "../services/salesService"

// Hooks / Utils
import { useProductsData } from "../hooks/useProductsData"
import { useProductsRealtime } from "../hooks/useProductsRealtime"
import { useBodyLock } from "../hooks/useBodyLock"
import { useProductSizes } from "../hooks/useProductSizes"
import { useCartFlow } from "../hooks/useCartFlow"
import { useSaleRegister } from "../hooks/useSaleRegister"

// Componentes
import { ProductCard } from "./ProductCard"
import { SizeModal } from "./SizeModal"
import { CartModal } from "./CartModal"
import { RecentSalesModal } from "./RecentSalesModal"

function MainApp() {
  const { products, originalProducts, matrix, loadProducts } = useProductsData(getProducts)

  const [showCart, setShowCart] = useState(false)
  const [showRecent, setShowRecent] = useState(false)
  useEffect(() => { loadProducts() }, [])

  const { getSizesFor } = useProductSizes(originalProducts)

  const cart = useCartFlow({
    originalProducts,
    matrix,
    getSizesFor,
    products,
  })

  const addProductFromSocket = useCallback((productId) => {
    const match = originalProducts.find(
      (p) =>
        String(p.productMatrixId ?? "") === String(productId) ||
        String(p.id ?? "") === String(productId) ||
        String(p.producto_id ?? "") === String(productId)
    )

    if (!match) {
      console.warn("Producto no encontrado para socket id:", productId)
      return false
    }

    cart.addItemDirect(match, { fromSocket: true })
    return true
  }, [originalProducts, cart.addItemDirect])

  useProductsRealtime({
    onReload: loadProducts,
    onAddProduct: addProductFromSocket,
    onOpenCart: () => setShowCart(true),
  })

  useBodyLock(Boolean(cart.selectedProduct || showCart || showRecent))

  const { register } = useSaleRegister({ registerSale })

  const cartButtonDisabled = cart.cartItems.length === 0

  const handleRegisterSale = async () => {
    try {
      await register(cart.groupedItems)

      cart.clearCart()
      setShowCart(false)
    } catch (error) {
      const Swal = (await import("sweetalert2")).default
      Swal.fire({
        title: "Error",
        text: error.message,
        icon: "error",
      })
    }
  }

  const handleEditItem = (item, index) => {
    const idx = index ?? item?.sourceIndex ?? (item?.sourceIndices ? item.sourceIndices[0] : null)
    if (idx === null || idx === undefined) return

    const res = cart.startEditItem(item, idx)
    if (!res.ok) return
    setShowCart(false)
  }

  return (
    <div className="app">
      <header className="top-bar">
        <div className="top-title">Panel de Ventas Tropical APP</div>

        <div className="top-icons">
          <button className="icon-button" onClick={() => setShowRecent(true)}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </button>

          <button className="icon-button" onClick={() => setShowCart(true)} style={{ position: "relative" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>

            {cart.cartCount > 0 && <span className="cart-badge">{cart.cartCount}</span>}
          </button>
        </div>
      </header>

      <main className="main">
        <div className="product-panel">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} onSelect={cart.selectProduct} />
          ))}
        </div>

        <div className="continue-wrapper">
          <button
            className={`btn-gradient ${cartButtonDisabled ? "btn-disabled" : ""}`}
            onClick={() => setShowCart(true)}
            disabled={cartButtonDisabled}
          >
            Continuar pedido
          </button>
        </div>
      </main>

      {cart.selectedProduct && (
        <SizeModal
          product={cart.selectedProduct}
          sizes={cart.sizes}
          sizeState={cart.sizeState}
          onUpdateSize={cart.updateSize}
          onConfirm={() => {
            cart.confirmSizes()
            // mismo comportamiento anterior:
            if (cart.editIndex !== null) setShowCart(true)
          }}
          onCancel={() => {
            cart.finishEditCancel()
            if (cart.editIndex !== null) setShowCart(true)
          }}
          activeSizeId={cart.editIndex !== null ? cart.sizeState.__activeSizeId : null}
        />
      )}

      {showCart && (
        <CartModal
          items={cart.groupedItems.map((item) => ({ ...item, onRemove: () => cart.removeGroup(item) }))}
          onClose={() => setShowCart(false)}
          onClear={cart.clearCart}
          onRegister={handleRegisterSale}
          onEditItem={handleEditItem}
        />
      )}

      {showRecent && <RecentSalesModal onClose={() => setShowRecent(false)} />}
    </div>
  )
}

export default MainApp
