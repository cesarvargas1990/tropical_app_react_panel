import { describe, expect, it, vi, beforeEach } from "vitest";
import axios from "axios";
import {
  getGranizadosCampaignTotal,
  GRANIZADOS_TOTAL_URL,
} from "../../../src/features/campaign";

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("granizadosCampaignService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("consume el endpoint publico remoto", async () => {
    axios.get.mockResolvedValueOnce({
      data: { granizados_total: 12, ladrillos_total: 12 },
    });

    const result = await getGranizadosCampaignTotal();

    expect(axios.get).toHaveBeenCalledWith(
      GRANIZADOS_TOTAL_URL,
      expect.objectContaining({
        headers: { Accept: "application/json" },
        params: expect.objectContaining({ t: expect.any(Number) }),
      }),
    );
    expect(result).toEqual({ granizados_total: 12, ladrillos_total: 12 });
  });
});
