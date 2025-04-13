// import fetch from 'node-fetch'
import db from '../db/connection.js'
// const AUTH_SERVICE_URL = 'http://authentication:3000'

export class User {
  static async findById (id) {
    try {
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id)
      return user || null
    } catch (error) {
      console.error('Error fetching user:', error)
      return null
    }
  }

  static async findByEmail (email) {
    try {
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
      return user || null
    } catch (error) {
      console.error('Error fetching user:', error)
      return null
    }
  }

  static async create (userData) {
    try {
      const stmt = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)')
      const result = stmt.run(userData.username, userData.email, userData.password)
      return { id: result.lastInsertRowid, ...userData }
    } catch (error) {
      console.error('Error creating user:', error)
      return null
    }
  }
}
