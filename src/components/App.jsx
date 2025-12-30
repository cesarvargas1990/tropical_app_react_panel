import React, { useState } from "react"
import { Login } from "./Login"
import MainApp from "./MainApp"

export default function App() {
  const [auth, setAuth] = useState(!!localStorage.getItem("auth_token"))

  return auth ? (
    <MainApp onLogout={() => setAuth(false)} />
  ) : (
    <Login onLoginSuccess={() => setAuth(true)} />
  )
}
