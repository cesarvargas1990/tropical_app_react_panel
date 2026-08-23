const CAMPAIGN_ROUTES = new Set([
  "/campana-granizados",
  "/tropical/campana-granizados",
]);

export function isGranizadosCampaignRoute(pathname = window.location.pathname) {
  return CAMPAIGN_ROUTES.has(pathname);
}
