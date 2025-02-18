import database from '../database/database.js'

export const createUser = async (email, displayName, password) => {
  await database('users').insert({ email, displayName, password });
};

export const getUserByEmail = async (email) => {
  await database('users').where({ email }).first();
};

export const getUserByDisplayName = async (displayName) => {
  await database('users').where({ displayName }).first();
};