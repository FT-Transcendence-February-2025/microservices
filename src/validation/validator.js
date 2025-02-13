import validator from 'validator'
import { Filter } from 'bad-words'
import { getUserByEmail, getUserByDisplayName } from '../services/user_service.js';

const filter = new Filter();

export const emailValidator = async (email) => {

  if (!validator.isEmail(email)) {
    return { valid: false, error: 'Invalid email address' };
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return { valid: false, error: 'Email already in use' };
  }

  return { valid: true };
};

export const displayNameValidator = async (displayName) => {
  if (displayName.length < 4) {
    return { valid: false, error: 'Display name too short (min 4 characters)' };
  }

  if (displayName.length > 25) {
    return { valid: false, error: 'Display name too long (max 25 characters)' };
  }

  if (filter.isProfane(displayName)) {
    return { valid: false, error: 'Display name contains profane words' };
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(displayName)) {
    return { valid: false, error: 'Display name contains invalid characters' };
  }

  if (!/[a-zA-Z]/.test(displayName)) {
    return {valid: false, error: 'Display name must contain at least one letter' };
  }

  const existingUser = await getUserByDisplayName(displayName);
  if (existingUser) {
    return { valid: false, error: 'Display name already in use' };
  }

  return { valid: true };
};
