import React from "react";
import { useAuth, Login } from "../../features/auth";
import { GranizadosCampaign } from "../../features/campaign";
import { isGranizadosCampaignRoute } from "../routes";
import MainApp from "./MainApp";

function AuthenticatedApp() {
  const { isAuthenticated, logout, userName } = useAuth();

  return isAuthenticated ? (
    <MainApp onLogout={logout} userName={userName} />
  ) : (
    <Login onLoginSuccess={() => window.location.reload()} />
  );
}

/**
 * Componente raíz con gestión de autenticación
 * Utiliza el hook useAuth para controlar el flujo de login/logout
 */
export default function App() {
  if (isGranizadosCampaignRoute()) {
    return <GranizadosCampaign />;
  }

  return <AuthenticatedApp />;
}
