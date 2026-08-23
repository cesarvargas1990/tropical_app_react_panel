import { describe, expect, it } from "vitest";
import { isGranizadosCampaignRoute } from "../../src/shared/routes";

describe("shared routes", () => {
  it("reconoce las rutas publicas de campana", () => {
    expect(isGranizadosCampaignRoute("/campana-granizados")).toBe(true);
    expect(isGranizadosCampaignRoute("/tropical/campana-granizados")).toBe(
      true,
    );
  });

  it("mantiene el resto de rutas en el flujo normal", () => {
    expect(isGranizadosCampaignRoute("/")).toBe(false);
    expect(isGranizadosCampaignRoute("/login")).toBe(false);
  });
});
