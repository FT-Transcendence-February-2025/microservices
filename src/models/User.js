import fetch from 'node-fetch'

const AUTH_SERVICE_URL = 'http://authentication:3000'

export class User {
  static async findById (id) {
    try {
      const response = await fetch(`${AUTH_SERVICE_URL}/api/users/${id}`)
      if (!response.ok) return null
      const userData = await response.json()
      return userData
    } catch (error) {
      console.error('Error fetching user:', error)
      return null
    }
  }

  static async findByEmail (email) {
    try {
      const response = await fetch(
        `${AUTH_SERVICE_URL}/api/users/email/${email}`
      )
      if (!response.ok) return null
      const userData = await response.json()
      return userData
    } catch (error) {
      console.error('Error fetching user:', error)
      return null
    }
  }
}
