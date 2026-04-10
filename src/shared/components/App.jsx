import React from "react";
import { useAuth, Login } from "../../features/auth";
import MainApp from "./MainApp";

/**
 * Componente raíz con gestión de autenticación
 * Utiliza el hook useAuth para controlar el flujo de login/logout
 */
export default function App() {
  const { isAuthenticated, logout, userName } = useAuth();

  return isAuthenticated ? (
    <MainApp onLogout={logout} userName={userName} />
  ) : (
    <Login onLoginSuccess={() => window.location.reload()} />
  );
}
