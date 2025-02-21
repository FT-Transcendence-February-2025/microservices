import { authDb } from '../db/connection.js';

export class User {
  static async create(userData) {
    // Insert new user into database and Return the created user record
    return authDb('users').insert(userData).returning();
  }

  static async findById(id) {
    // Queries user by ID. Returns first matching
    return authDb('users').where({ id }).first();
  }

  static async findByEmail(email) {
    // Queries user by email. Return first mathing user or undefined
    return authDb('users').where({ email }).first();
  }
}
