import { describe, expect, it } from "vitest";

import * as authFeature from "../../src/features/auth";
import { Login } from "../../src/features/auth/components/Login";
import { useAuth } from "../../src/features/auth/hooks/useAuth";
import { apiLogin } from "../../src/features/auth/services/authService";
import * as cartFeature from "../../src/features/cart";
import { CartModal } from "../../src/features/cart/components/CartModal/index";
import { Keypad } from "../../src/features/cart/components/Keypad/index";
import { SizeCard } from "../../src/features/cart/components/SizeCard/index";
import { SizeModal } from "../../src/features/cart/components/SizeModal/index";
import { useCartFlow } from "../../src/features/cart/hooks/useCartFlow";
import { useKeypad } from "../../src/features/cart/hooks/useKeypad";
import { useSizeCalculations } from "../../src/features/cart/hooks/useSizeCalculations";
import { useSizeUpdates } from "../../src/features/cart/hooks/useSizeUpdates";
import {
  buildCartItems,
  buildEditSizeState,
} from "../../src/features/cart/utils/cartBuilder";
import * as sharedFeature from "../../src/shared";
import { AppHeader } from "../../src/shared/components/AppHeader";
import { ScannerPanel } from "../../src/shared/components/ScannerPanel";
import { useBodyLock } from "../../src/shared/hooks/useBodyLock";
import { useCartActions } from "../../src/shared/hooks/useCartActions";
import { useModalState } from "../../src/shared/hooks/useModalState";
import { useProductActions } from "../../src/shared/hooks/useProductActions";
import { useScannerInput } from "../../src/shared/hooks/useScannerInput";
import api from "../../src/shared/services/api";

describe("feature barrel exports", () => {
  it("re-exports the auth feature public api", () => {
    expect(authFeature.Login).toBe(Login);
    expect(authFeature.useAuth).toBe(useAuth);
    expect(authFeature.apiLogin).toBe(apiLogin);
  });

  it("re-exports the cart feature public api", () => {
    expect(cartFeature.CartModal).toBe(CartModal);
    expect(cartFeature.SizeModal).toBe(SizeModal);
    expect(cartFeature.SizeCard).toBe(SizeCard);
    expect(cartFeature.Keypad).toBe(Keypad);
    expect(cartFeature.useCartFlow).toBe(useCartFlow);
    expect(cartFeature.useSizeCalculations).toBe(useSizeCalculations);
    expect(cartFeature.useKeypad).toBe(useKeypad);
    expect(cartFeature.useSizeUpdates).toBe(useSizeUpdates);
    expect(cartFeature.buildCartItems).toBe(buildCartItems);
    expect(cartFeature.buildEditSizeState).toBe(buildEditSizeState);
  });

  it("re-exports the shared public api", () => {
    expect(sharedFeature.api).toBe(api);
    expect(sharedFeature.useBodyLock).toBe(useBodyLock);
    expect(sharedFeature.useScannerInput).toBe(useScannerInput);
    expect(sharedFeature.useModalState).toBe(useModalState);
    expect(sharedFeature.useProductActions).toBe(useProductActions);
    expect(sharedFeature.useCartActions).toBe(useCartActions);
    expect(sharedFeature.AppHeader).toBe(AppHeader);
    expect(sharedFeature.ScannerPanel).toBe(ScannerPanel);
  });
});
