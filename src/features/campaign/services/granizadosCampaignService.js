import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;

export const GRANIZADOS_TOTAL_URL = `${API_URL}/api/public/granizados/total`;

export async function getGranizadosCampaignTotal() {
  const response = await axios.get(GRANIZADOS_TOTAL_URL, {
    headers: { Accept: "application/json" },
    params: { t: Date.now() },
  });

  return response.data;
}
