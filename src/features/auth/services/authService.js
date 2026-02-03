import axios from "axios"

const API_URL = import.meta.env.VITE_BACKEND_URL

export async function apiLogin(email, password) {
  try {
    const res = await axios.post(`${API_URL}/api/login`, {
      email,
      password
    })

    if (!res.data || !res.data.token) {
      throw new Error("Token no recibido del servidor")
    }

    return res.data.token
  } catch {
    throw new Error("Credenciales incorrectas")
  }
}
