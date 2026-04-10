import React, { useCallback, useEffect, useMemo, useState } from "react";

// Features imports
import {
  ProductCard,
  getDirectAccessProductsConfig,
  getProducts,
  useProductsData,
  useProductSizes,
  useProductsRealtime,
} from "../../features/products";
import { CartModal, SizeModal, useCartFlow } from "../../features/cart";
import {
  RecentSalesModal,
  registerSale,
  useSaleRegister,
} from "../../features/sales";

// Shared hooks
import { useBodyLock } from "../hooks/useBodyLock";
import { useScannerInput } from "../hooks/useScannerInput";
import { useModalState } from "../hooks/useModalState";
import { useProductActions } from "../hooks/useProductActions";
import { useCartActions } from "../hooks/useCartActions";

// Shared components
import { AppHeader } from "./AppHeader";
import { ProductSearchKeyboard } from "./ProductSearchKeyboard";

function normalizeProductText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

function resolveDirectAccessGroupName(product) {
  return (
    product.sabor ??
    product.name ??
    product.productName ??
    product.nombre ??
    "Producto"
  );
}

/**
 * Componente principal de la aplicación
 * Orquesta todas las features: products, cart, sales
 */
function MainApp() {
  // Data loading
  const { products, originalProducts, matrix, loadProducts } =
    useProductsData(getProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchKeyboard, setShowSearchKeyboard] = useState(false);
  const [directAccessProductIds, setDirectAccessProductIds] = useState([]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    let cancelled = false;

    void getDirectAccessProductsConfig()
      .then((payload) => {
        if (cancelled) return;

        const nextIds = Array.isArray(payload?.productMatrixIds)
          ? payload.productMatrixIds
              .map((value) => Number(value))
              .filter((value) => Number.isFinite(value) && value > 0)
          : [];

        setDirectAccessProductIds(nextIds);
      })
      .catch(() => {
        if (!cancelled) {
          setDirectAccessProductIds([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Modal state
  const { showCart, showRecent, openCart, closeCart, openRecent, closeRecent } =
    useModalState();

  // Product sizes
  const { getSizesFor } = useProductSizes(originalProducts);

  // Cart flow
  const cart = useCartFlow({
    originalProducts,
    matrix,
    getSizesFor,
    products,
  });

  // Product actions (scanner + socket)
  const { handleScannerSubmit } = useProductActions({
    originalProducts,
    cart,
    onCartOpen: openCart,
  });

  // Scanner input management
  const scanner = useScannerInput({
    onSubmit: handleScannerSubmit,
  });

  // Re-focus scanner on state changes
  useEffect(() => {
    scanner.forceScannerFocus();
  }, [
    scanner,
    scanner.scannerValue,
    showCart,
    showRecent,
    cart.selectedProduct,
    scanner.forceScannerFocus,
  ]);

  // Real-time updates via WebSocket
  const handleLegacyProductEvent = useCallback(() => {
    void cart.syncCart();
  }, [cart]);

  const handleCartUpdated = useCallback(
    (event) => {
      if (!event) return;
      if (String(event.deviceId ?? "") !== String(cart.deviceId)) return;
      if (Number(event.version ?? 0) <= Number(cart.cartVersion ?? 0)) return;
      if (cart.selectedProduct) return;

      void cart.syncCart();
    },
    [cart],
  );

  useProductsRealtime({
    onReload: loadProducts,
    onLegacyProductEvent: handleLegacyProductEvent,
    onCartUpdated: handleCartUpdated,
  });

  // Body scroll lock when modals are open
  useBodyLock(Boolean(cart.selectedProduct || showCart || showRecent));

  // Sales registration
  const { register, showSuccess } = useSaleRegister({ registerSale });

  // Cart actions
  const { handleRegisterSale, handleEditItem, cartButtonDisabled } =
    useCartActions({
      cart,
      register,
      closeCart,
      showSaleSuccess: showSuccess,
    });

  const filteredProducts = useMemo(() => {
    const normalizedQuery = normalizeProductText(searchQuery);
    if (!normalizedQuery) return products;

    return products.filter((product) => {
      const haystack = normalizeProductText(
        `${product.name} ${product.caracteristica}`,
      );
      return haystack.includes(normalizedQuery);
    });
  }, [products, searchQuery]);

  const directAccessProducts = useMemo(() => {
    if (!directAccessProductIds.length) return [];

    const productByMatrixId = new Map(
      originalProducts.map((product) => [
        String(product.productMatrixId ?? product.id ?? ""),
        product,
      ]),
    );

    return directAccessProductIds
      .map((productId) => productByMatrixId.get(String(productId)))
      .filter(Boolean);
  }, [directAccessProductIds, originalProducts]);

  const directAccessCounts = useMemo(() => {
    return cart.cartItems.reduce((acc, item) => {
      const key = String(item.productMatrixId ?? "");
      acc[key] = (acc[key] ?? 0) + Number(item.quantity ?? 0);
      return acc;
    }, {});
  }, [cart.cartItems]);

  const directAccessGroups = useMemo(() => {
    return directAccessProducts.reduce((acc, product) => {
      const groupName = resolveDirectAccessGroupName(product);

      if (!acc[groupName]) {
        acc[groupName] = [];
      }

      acc[groupName].push(product);
      return acc;
    }, {});
  }, [directAccessProducts]);

  const scrollToTop = useCallback(() => {
    globalThis.scrollTo?.({ top: 0, behavior: "auto" });
  }, []);

  const handleRegisterAndScroll = useCallback(async () => {
    const ok = await handleRegisterSale();
    if (ok) scrollToTop();
  }, [handleRegisterSale, scrollToTop]);

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
        onSearchClick={() => setShowSearchKeyboard(true)}
      />

      <main className="main">
        {directAccessProducts.length ? (
          <section className="direct-access-section">
            <div className="direct-access-header">
              <h2 className="direct-access-title">Granizados</h2>
            </div>

            <div className="direct-access-groups">
              {Object.entries(directAccessGroups).map(([groupName, items]) => (
                <section key={groupName} className="direct-access-group">
                  <h3 className="direct-access-group-title">{groupName}</h3>

                  <div className="direct-access-grid">
                    {items.map((product) => {
                      const productKey = String(
                        product.productMatrixId ?? product.id ?? "",
                      );
                      const badgeCount = directAccessCounts[productKey] ?? 0;
                      const detailText =
                        product.caracteristica &&
                        product.caracteristica !== groupName
                          ? product.caracteristica
                          : null;

                      return (
                        <button
                          key={productKey}
                          type="button"
                          className="direct-access-card"
                          onClick={() => {
                            void cart.addItemDirect(product);
                          }}
                          aria-label={`Agregar ${groupName} ${product.tamano}`}
                        >
                          {badgeCount > 0 ? (
                            <span className="direct-access-badge">
                              {badgeCount}
                            </span>
                          ) : null}

                          <span className="direct-access-size">
                            {product.tamano ?? "Tamaño"}
                          </span>
                          <span className="direct-access-price">
                            {currencyFormatter.format(
                              Number(product.valor ?? 0),
                            )}
                          </span>
                          {detailText ? (
                            <span className="direct-access-detail">
                              {detailText}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </section>
        ) : null}

        <div className="product-search-bar">
          <button
            type="button"
            className="product-search-display"
            onClick={() => setShowSearchKeyboard(true)}
            aria-label="Buscar producto"
          >
            <span className="product-search-label">Buscar producto</span>
            <span className="product-search-value">
              {searchQuery ||
                "Toca para buscar un producto con el teclado en pantalla"}
            </span>
          </button>

          {searchQuery ? (
            <button
              type="button"
              className="btn-secondary product-search-clear"
              onClick={() => setSearchQuery("")}
            >
              Limpiar
            </button>
          ) : null}
        </div>

        <div className="product-panel">
          {filteredProducts.map((p) => (
            <ProductCard key={p.id} product={p} onSelect={cart.selectProduct} />
          ))}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="product-search-empty">
            No hay productos que coincidan con &quot;{searchQuery}&quot;.
          </div>
        ) : null}

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
            const wasEditing = cart.editIndex !== null;
            void Promise.resolve(cart.confirmSizes()).then((ok) => {
              if (!ok) return;
              scrollToTop();
              if (wasEditing) openCart();
            });
          }}
          onCancel={() => {
            cart.finishEditCancel();
            if (cart.editIndex !== null) openCart();
          }}
          activeSizeId={
            cart.editIndex !== null ? cart.sizeState.__activeSizeId : null
          }
        />
      )}

      {showCart && (
        <CartModal
          items={cart.groupedItems.map((item) => ({
            ...item,
            onRemove: () => cart.removeGroup(item),
          }))}
          onClose={closeCart}
          onClear={cart.clearCart}
          onRegister={handleRegisterAndScroll}
          onEditItem={handleEditItem}
        />
      )}

      {showRecent && <RecentSalesModal onClose={closeRecent} />}

      <ProductSearchKeyboard
        value={searchQuery}
        open={showSearchKeyboard}
        resultCount={filteredProducts.length}
        onClose={() => setShowSearchKeyboard(false)}
        onChange={setSearchQuery}
        onBackspace={() => setSearchQuery((prev) => prev.slice(0, -1))}
        onClear={() => setSearchQuery("")}
      />
    </div>
  );
}

export default MainApp;
