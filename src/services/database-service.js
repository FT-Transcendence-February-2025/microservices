import database from '../database/database.js'

export const createUser = async (email, displayName, password) => {
	try {
		await database('users').insert({ email, displayName, password });
	} catch (error) {
		throw new Error(error);
	}
};

export const getUserByEmail = async (email) => {
	try {
		return await database('users').where({ email }).first();
	} catch (error) {
		throw new Error(error);
	}
};

export const getUserByDisplayName = async (displayName) => {
	try {
		return await database('users').where({ displayName }).first();
	} catch (error) {
		throw new Error(error);
	}
};

export const getUserById = async (id) => {
	try {
		return await database('users').where({ id }).first();
	} catch (error) {
		throw new Error(error);
	}
};

export const updatePassword = async (id, newPassword) => {
	try {
		await database('users')
			.where({ id })
			.update({ password: newPassword });
	} catch (error) {
		throw new Error(error);
	}
};