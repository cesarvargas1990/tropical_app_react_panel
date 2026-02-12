import React from "react";
import { useAuth, Login } from "../../features/auth";
import MainApp from "./MainApp";

/**
 * Componente raíz con gestión de autenticación
 * Utiliza el hook useAuth para controlar el flujo de login/logout
 */
export default function App() {
  const { isAuthenticated, logout } = useAuth();

  return isAuthenticated ? (
    <MainApp onLogout={logout} />
  ) : (
    <Login onLoginSuccess={() => window.location.reload()} />
  );
}
