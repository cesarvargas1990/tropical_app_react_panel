import React, { useEffect } from "react"

// Features imports
import { ProductCard, getProducts, useProductsData, useProductSizes, useProductsRealtime } from "../../features/products"
import { CartModal, SizeModal, useCartFlow } from "../../features/cart"
import { RecentSalesModal, registerSale, useSaleRegister } from "../../features/sales"

// Shared hooks
import { useBodyLock } from "../hooks/useBodyLock"
import { useScannerInput } from "../hooks/useScannerInput"
import { useModalState } from "../hooks/useModalState"
import { useProductActions } from "../hooks/useProductActions"
import { useCartActions } from "../hooks/useCartActions"

// Shared components
import { AppHeader } from "./AppHeader"

/**
 * Componente principal de la aplicación
 * Orquesta todas las features: products, cart, sales
 */
function MainApp() {
  // Data loading
  const { products, originalProducts, matrix, loadProducts } = useProductsData(getProducts)
  
  useEffect(() => { loadProducts() }, [loadProducts])

  // Modal state
  const { showCart, showRecent, openCart, closeCart, openRecent, closeRecent } = useModalState()

  // Product sizes
  const { getSizesFor } = useProductSizes(originalProducts)

  // Cart flow
  const cart = useCartFlow({
    originalProducts,
    matrix,
    getSizesFor,
    products,
  })

  // Product actions (scanner + socket)
  const { addProductFromSocket, handleScannerSubmit } = useProductActions({
    originalProducts,
    cart,
    onCartOpen: openCart,
  })

  // Scanner input management
  const scanner = useScannerInput({
    onSubmit: handleScannerSubmit,
  })

  // Re-focus scanner on state changes
  useEffect(() => {
    scanner.forceScannerFocus()
  }, [scanner.scannerValue, showCart, showRecent, cart.selectedProduct, scanner.forceScannerFocus])

  // Real-time updates via WebSocket
  useProductsRealtime({
    onReload: loadProducts,
    onAddProduct: addProductFromSocket,
    onOpenCart: openCart,
  })

  // Body scroll lock when modals are open
  useBodyLock(Boolean(cart.selectedProduct || showCart || showRecent))

  // Sales registration
  const { register } = useSaleRegister({ registerSale })

  // Cart actions
  const { handleRegisterSale, handleEditItem, cartButtonDisabled } = useCartActions({
    cart,
    register,
    closeCart,
  })

  return (
    <div className="app">
      <AppHeader
        scannerProps={{
          appActive: scanner.appActive,
          scannerFocused: scanner.scannerFocused,
          scannerValue: scanner.scannerValue,
          scannerInputRef: scanner.scannerInputRef,
          onFocusClick: scanner.focusScannerInput,
          onChange: scanner.handleScannerChange,
          onKeyDown: scanner.handleScannerKeyDown,
          onBlur: scanner.handleScannerBlur,
          onFocus: scanner.handleScannerFocus,
        }}
        cartCount={cart.cartCount}
        onRecentClick={openRecent}
        onCartClick={openCart}
      />

      <main className="main">
        <div className="product-panel">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} onSelect={cart.selectProduct} />
          ))}
        </div>

        <div className="continue-wrapper">
          <button
            className={`btn-gradient ${cartButtonDisabled ? "btn-disabled" : ""}`}
            onClick={openCart}
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
            if (cart.editIndex !== null) openCart()
          }}
          onCancel={() => {
            cart.finishEditCancel()
            if (cart.editIndex !== null) openCart()
          }}
          activeSizeId={cart.editIndex !== null ? cart.sizeState.__activeSizeId : null}
        />
      )}

      {showCart && (
        <CartModal
          items={cart.groupedItems.map((item) => ({ ...item, onRemove: () => cart.removeGroup(item) }))}
          onClose={closeCart}
          onClear={cart.clearCart}
          onRegister={handleRegisterSale}
          onEditItem={handleEditItem}
        />
      )}

      {showRecent && <RecentSalesModal onClose={closeRecent} />}
    </div>
  )
}

export default MainApp
