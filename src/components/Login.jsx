import React, { useState } from "react"
import Swal from "sweetalert2"
import { apiLogin } from "../services/authService"

export function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const token = await apiLogin(email, password)
      localStorage.setItem("auth_token", token)
      onLoginSuccess()

    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Credenciales incorrectas",
        background: "#0f172a",
        color: "#fff",
        confirmButtonColor: "#6366F1",
      })
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Iniciar sesión</h2>

        <form onSubmit={handleSubmit}>

          <input
            type="email"
            placeholder="Correo"
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="login-btn" type="submit">
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
