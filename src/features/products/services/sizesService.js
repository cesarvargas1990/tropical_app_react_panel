import api from '../../../shared/services/api'

export async function getSizes() {
  try {
    const { data } = await api.get('api/sizes')
    return data
  } catch (err) {
    console.error('Error obteniendo tamaños:', err)
    return []
  }
}
