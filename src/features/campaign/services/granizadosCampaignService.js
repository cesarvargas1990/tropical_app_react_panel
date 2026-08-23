import axios from "axios";

export const GRANIZADOS_TOTAL_URL =
  "http://147.93.1.252:8000/api/public/granizados/total";

export async function getGranizadosCampaignTotal() {
  const response = await axios.get(GRANIZADOS_TOTAL_URL, {
    headers: { Accept: "application/json" },
    params: { t: Date.now() },
  });

  return response.data;
}
