import React, { useState } from "react"
import PropTypes from "prop-types"
import Swal from "sweetalert2"
import { useAuth } from "../hooks/useAuth"

export function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { login, isLoading } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()

    const result = await login(email, password)

    if (result.success) {
      onLoginSuccess()
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: result.error || "Credenciales incorrectas",
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
            disabled={isLoading}
          />

          <input
            type="password"
            placeholder="Contraseña"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />

          <button className="login-btn" type="submit" disabled={isLoading}>
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  )
}

Login.propTypes = {
  onLoginSuccess: PropTypes.func.isRequired,
}

export default Login
