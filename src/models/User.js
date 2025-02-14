import { db } from '../db/connection.js'

export class User {
	static async create(userData) {
		// Insert new user into database and Return the created user record
		return db('users').insert(userData).returning();
	}

	static async findById(id) {
		// Queries user by ID. Returns first matching
		return db('users').where({ id }).first();
	}

	static async findByEmail(email) {
		// Queries user by email. Return first mathing user or undefined
		return db('users').where({ email }).first();
	}
}