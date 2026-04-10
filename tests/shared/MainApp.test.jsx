import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import MainApp from "../../src/shared/components/MainApp";
import { useProductsData } from "../../src/features/products/hooks/useProductsData";
import { useProductsRealtime } from "../../src/features/products/hooks/useProductsRealtime";
import { useProductSizes } from "../../src/features/products/hooks/useProductSizes";
import { getDirectAccessProductsConfig } from "../../src/features/products/services/directAccessProductsService";
import { useCartFlow } from "../../src/features/cart";
import { useSaleRegister } from "../../src/features/sales/hooks/useSaleRegister";

const { swalFireMock } = vi.hoisted(() => ({
  swalFireMock: vi.fn(),
}));

vi.mock("../../src/features/products/hooks/useProductsData", () => ({
  useProductsData: vi.fn(),
}));

vi.mock("../../src/features/products/hooks/useProductsRealtime", () => ({
  useProductsRealtime: vi.fn(),
}));

vi.mock("../../src/features/products/hooks/useProductSizes", () => ({
  useProductSizes: vi.fn(),
}));

vi.mock(
  "../../src/features/products/services/directAccessProductsService",
  () => ({
    getDirectAccessProductsConfig: vi.fn(),
  }),
);

vi.mock("../../src/features/cart", () => ({
  CartModal: ({ items, onRegister }) => (
    <div data-testid="cart-modal">
      <div>items: {items.length}</div>
      <button onClick={onRegister}>trigger-register</button>
    </div>
  ),
  SizeModal: ({ onConfirm, onCancel }) => (
    <div data-testid="size-modal">
      <button onClick={onConfirm}>confirm-size</button>
      <button onClick={onCancel}>cancel-size</button>
    </div>
  ),
  useCartFlow: vi.fn(),
}));

vi.mock("../../src/shared/hooks/useBodyLock", () => ({
  useBodyLock: vi.fn(),
}));

vi.mock("../../src/features/sales/hooks/useSaleRegister", () => ({
  useSaleRegister: vi.fn(),
}));

vi.mock("../../src/features/products/components/ProductCard", () => ({
  ProductCard: ({ product, onSelect }) => (
    <button
      data-testid={`product-${product.id}`}
      onClick={() => onSelect(product)}
    >
      {product.name}
    </button>
  ),
}));

vi.mock("../../src/features/sales/components/RecentSalesModal", () => ({
  RecentSalesModal: ({ onClose }) => (
    <div data-testid="recent-sales">
      <button onClick={onClose}>close-recent</button>
    </div>
  ),
}));

vi.mock("sweetalert2", () => ({
  default: {
    fire: swalFireMock,
  },
}));

const baseProducts = [
  { id: 1, name: "Maracuya", caracteristica: "clasico" },
  { id: 2, name: "Lulo", caracteristica: "fresco" },
];

const createCartState = (overrides = {}) => ({
  deviceId: "tablet-test",
  cartVersion: 1,
  selectedProduct: null,
  sizes: [],
  sizeState: { __activeSizeId: null },
  cartItems: [],
  groupedItems: [],
  editIndex: null,
  cartCount: 0,
  syncCart: vi.fn().mockResolvedValue({ items_count: 0 }),
  selectProduct: vi.fn(),
  updateSize: vi.fn(),
  confirmSizes: vi.fn().mockResolvedValue(true),
  removeCartItem: vi.fn(),
  removeGroup: vi.fn(),
  clearCart: vi.fn(),
  resetCart: vi.fn(),
  startEditItem: vi.fn(() => ({ ok: true })),
  finishEditCancel: vi.fn(),
  ...overrides,
});

describe("MainApp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    swalFireMock.mockReset();
    vi.stubEnv("VITE_APP_VERSION", "2.0");
    globalThis.scrollTo = vi.fn();

    useProductSizes.mockReturnValue({ getSizesFor: vi.fn() });
    getDirectAccessProductsConfig.mockResolvedValue({ productMatrixIds: [] });
  });

  it("scrolls to top when confirming product sizes", async () => {
    const loadProducts = vi.fn();
    useProductsData.mockReturnValue({
      products: baseProducts,
      originalProducts: baseProducts,
      matrix: {},
      loadProducts,
    });
    useProductsRealtime.mockImplementation(() => {});
    useSaleRegister.mockReturnValue({
      register: vi.fn(),
      showSuccess: vi.fn(),
    });

    const cartState = createCartState({
      selectedProduct: baseProducts[0],
      sizes: [{ id: 1, name: "Mediano" }],
    });
    useCartFlow.mockReturnValue(cartState);

    render(<MainApp />);

    fireEvent.click(screen.getByText("confirm-size"));

    await waitFor(() => {
      expect(cartState.confirmSizes).toHaveBeenCalledTimes(1);
      expect(globalThis.scrollTo).toHaveBeenCalledWith({
        top: 0,
        behavior: "auto",
      });
    });
  });

  it("renders direct access cards from configured product ids and adds items directly", async () => {
    const loadProducts = vi.fn();
    getDirectAccessProductsConfig.mockResolvedValue({
      productMatrixIds: [334, 336, 338],
    });

    useProductsData.mockReturnValue({
      products: baseProducts,
      originalProducts: [
        {
          productMatrixId: 334,
          sabor_id: 1,
          carac_id: 7,
          sabor: "Refrescante",
          caracteristica: "Refrescante",
          tamano: "M",
          valor: 8000,
        },
        {
          productMatrixId: 336,
          sabor_id: 1,
          carac_id: 7,
          sabor: "Refrescante",
          caracteristica: "Refrescante",
          tamano: "L",
          valor: 12000,
        },
        {
          productMatrixId: 338,
          sabor_id: 1,
          carac_id: 7,
          sabor: "Refrescante",
          caracteristica: "Refrescante",
          tamano: "XL",
          valor: 16000,
        },
      ],
      matrix: {},
      loadProducts,
    });
    useProductsRealtime.mockImplementation(() => {});
    useSaleRegister.mockReturnValue({
      register: vi.fn(),
      showSuccess: vi.fn(),
    });

    const cartState = createCartState({
      cartItems: [
        { productMatrixId: 336, quantity: 2 },
        { productMatrixId: 338, quantity: 1 },
      ],
      addItemDirect: vi.fn().mockResolvedValue(true),
    });
    useCartFlow.mockReturnValue(cartState);

    render(<MainApp />);

    expect(await screen.findByText("Granizados")).toBeInTheDocument();
    expect(screen.getByText("Refrescante")).toBeInTheDocument();
    expect(screen.getByText("M")).toBeInTheDocument();
    expect(screen.getByText("L")).toBeInTheDocument();
    expect(screen.getByText("XL")).toBeInTheDocument();
    expect(screen.getByText(/\$.*8\.000/)).toBeInTheDocument();
    expect(screen.getByText(/\$.*12\.000/)).toBeInTheDocument();
    expect(screen.getByText(/\$.*16\.000/)).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.queryAllByText("Refrescante")).toHaveLength(1);

    fireEvent.click(
      screen.getByRole("button", { name: /agregar refrescante l/i }),
    );

    await waitFor(() => {
      expect(cartState.addItemDirect).toHaveBeenCalledWith(
        expect.objectContaining({ productMatrixId: 336 }),
      );
    });
  });

  it("loads products, wires realtime updates, and disables cart button when empty", () => {
    const loadProducts = vi.fn();
    useProductsData.mockReturnValue({
      products: baseProducts,
      originalProducts: baseProducts,
      matrix: {},
      loadProducts,
    });
    useProductsRealtime.mockImplementation(() => {});
    useCartFlow.mockReturnValue(createCartState());
    useSaleRegister.mockReturnValue({
      register: vi.fn(),
      showSuccess: vi.fn(),
    });

    render(<MainApp />);

    expect(loadProducts).toHaveBeenCalledTimes(1);
    expect(useProductsRealtime).toHaveBeenCalledWith(
      expect.objectContaining({
        onReload: loadProducts,
        onLegacyProductEvent: expect.any(Function),
        onCartUpdated: expect.any(Function),
      }),
    );

    expect(screen.getByTestId("product-1")).toBeInTheDocument();
    expect(screen.getByTestId("product-2")).toBeInTheDocument();
    expect(screen.getByText("v 2.0")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /buscar producto/i }),
    ).toBeInTheDocument();

    const continueButton = screen.getByRole("button", {
      name: /Continuar pedido/i,
    });
    expect(continueButton).toBeDisabled();
  });

  it("does not auto-open the cart from CartUpdated while the size modal is active", async () => {
    const loadProducts = vi.fn();
    let realtimeHandlers = null;

    useProductsData.mockReturnValue({
      products: baseProducts,
      originalProducts: baseProducts,
      matrix: {},
      loadProducts,
    });
    useProductsRealtime.mockImplementation((handlers) => {
      realtimeHandlers = handlers;
    });
    useSaleRegister.mockReturnValue({
      register: vi.fn(),
      showSuccess: vi.fn(),
    });

    const cartState = createCartState({
      selectedProduct: baseProducts[0],
      sizes: [{ id: 1, name: "Mediano" }],
      cartVersion: 1,
      syncCart: vi.fn().mockResolvedValue({ items_count: 2 }),
    });
    useCartFlow.mockReturnValue(cartState);

    render(<MainApp />);

    await act(async () => {
      await realtimeHandlers.onCartUpdated({
        deviceId: "tablet-test",
        version: 2,
      });
    });

    expect(cartState.syncCart).not.toHaveBeenCalled();
    expect(screen.queryByTestId("cart-modal")).toBeNull();
    expect(screen.getByTestId("size-modal")).toBeInTheDocument();
  });

  it("syncs cart from socket updates without auto-opening the cart modal", async () => {
    const loadProducts = vi.fn();
    let realtimeHandlers = null;

    useProductsData.mockReturnValue({
      products: baseProducts,
      originalProducts: baseProducts,
      matrix: {},
      loadProducts,
    });
    useProductsRealtime.mockImplementation((handlers) => {
      realtimeHandlers = handlers;
    });
    useSaleRegister.mockReturnValue({
      register: vi.fn(),
      showSuccess: vi.fn(),
    });

    const cartState = createCartState({
      cartVersion: 1,
      cartCount: 1,
      syncCart: vi.fn().mockResolvedValue({ items_count: 2 }),
    });
    useCartFlow.mockReturnValue(cartState);

    render(<MainApp />);

    await act(async () => {
      await realtimeHandlers.onCartUpdated({
        deviceId: "tablet-test",
        version: 2,
      });
    });

    expect(cartState.syncCart).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("cart-modal")).toBeNull();
  });

  it("syncs legacy scanner events without auto-opening the cart modal", async () => {
    const loadProducts = vi.fn();
    let realtimeHandlers = null;

    useProductsData.mockReturnValue({
      products: baseProducts,
      originalProducts: baseProducts,
      matrix: {},
      loadProducts,
    });
    useProductsRealtime.mockImplementation((handlers) => {
      realtimeHandlers = handlers;
    });
    useSaleRegister.mockReturnValue({
      register: vi.fn(),
      showSuccess: vi.fn(),
    });

    const cartState = createCartState({
      cartCount: 1,
      syncCart: vi.fn().mockResolvedValue({ items_count: 2 }),
    });
    useCartFlow.mockReturnValue(cartState);

    render(<MainApp />);

    await act(async () => {
      await realtimeHandlers.onLegacyProductEvent();
    });

    expect(cartState.syncCart).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("cart-modal")).toBeNull();
  });

  it("registers a sale, clears the cart and hides the modal on success", async () => {
    const loadProducts = vi.fn();
    useProductsData.mockReturnValue({
      products: baseProducts,
      originalProducts: baseProducts,
      matrix: {},
      loadProducts,
    });
    useProductsRealtime.mockImplementation(() => {});

    const cartState = createCartState({
      cartItems: [{ id: 99 }],
      groupedItems: [{ id: 99 }],
      cartCount: 2,
      syncCart: vi.fn().mockResolvedValue({ items_count: 0 }),
    });
    useCartFlow.mockReturnValue(cartState);

    const register = vi.fn().mockResolvedValue(undefined);
    const showSuccess = vi.fn().mockResolvedValue(undefined);
    useSaleRegister.mockReturnValue({ register, showSuccess });

    render(<MainApp />);

    fireEvent.click(screen.getByRole("button", { name: /Continuar pedido/i }));
    expect(screen.getByTestId("cart-modal")).toBeInTheDocument();

    vi.clearAllMocks();
    fireEvent.click(screen.getByText("trigger-register"));

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith(cartState.groupedItems);
    });

    expect(cartState.resetCart).toHaveBeenCalledTimes(1);
    expect(cartState.syncCart).toHaveBeenCalledTimes(1);
    expect(showSuccess).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(screen.queryByTestId("cart-modal")).toBeNull();
    });

    expect(globalThis.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: "auto",
    });
  });

  it("shows an alert and keeps the modal open if register fails", async () => {
    const loadProducts = vi.fn();
    useProductsData.mockReturnValue({
      products: baseProducts,
      originalProducts: baseProducts,
      matrix: {},
      loadProducts,
    });
    useProductsRealtime.mockImplementation(() => {});

    const cartState = createCartState({
      cartItems: [{ id: 1 }],
      groupedItems: [{ id: 1 }],
      cartCount: 1,
      syncCart: vi.fn(),
    });
    useCartFlow.mockReturnValue(cartState);

    const registerError = vi.fn().mockRejectedValue(new Error("boom"));
    useSaleRegister.mockReturnValue({
      register: registerError,
      showSuccess: vi.fn(),
    });

    render(<MainApp />);

    fireEvent.click(screen.getByRole("button", { name: /Continuar pedido/i }));
    fireEvent.click(screen.getByText("trigger-register"));

    await waitFor(() => {
      expect(registerError).toHaveBeenCalledWith(cartState.groupedItems);
      expect(swalFireMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Error",
          icon: "error",
        }),
      );
    });

    expect(cartState.syncCart).not.toHaveBeenCalled();
    expect(screen.getByTestId("cart-modal")).toBeInTheDocument();
  });

  it("filters visible products using the on-screen search keyboard", () => {
    const loadProducts = vi.fn();
    useProductsData.mockReturnValue({
      products: baseProducts,
      originalProducts: baseProducts,
      matrix: {},
      loadProducts,
    });
    useProductsRealtime.mockImplementation(() => {});
    useCartFlow.mockReturnValue(createCartState());
    useSaleRegister.mockReturnValue({
      register: vi.fn(),
      showSuccess: vi.fn(),
    });

    render(<MainApp />);

    fireEvent.click(screen.getByRole("button", { name: /buscar producto/i }));
    expect(screen.getByText("2 productos encontrados")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "L" }));
    fireEvent.click(screen.getByRole("button", { name: "U" }));

    expect(screen.getByText("1 producto encontrado")).toBeInTheDocument();
    expect(screen.getByTestId("product-2")).toBeInTheDocument();
    expect(screen.queryByTestId("product-1")).toBeNull();
  });
});
