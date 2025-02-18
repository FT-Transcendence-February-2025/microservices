import validator from 'validator'
import { Filter } from 'bad-words'
import zxcvbn from 'zxcvbn'
import { getUserByEmail, getUserByDisplayName } from '../services/database-service.js';

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

export const passwordValidator = async (password, email, displayName) => {
  if (password.length < 8) {
    return { valid: false, error: 'Password too short (min 8 characters)' };
  }

  if (password.length > 64) {
    return { valid: false, error: 'Password too long (max 64 characters)' };
  }

  if (!/[a-z]/.test(password) ||
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter, one uppercase letter, ' +
          'one digit, and one special character' };
  }

  if (password.toLowerCase().includes(email.toLowerCase()) ||
      password.toLowerCase().includes(displayName.toLowerCase())) {
    return { valid: false, error: 'Password should not contain your email or display name' };
  }

  const strengthValidator = zxcvbn(password);
  if (strengthValidator.score < 3) {
    return { valid: false, error: 'Password too weak' };
  }

  return { valid: true };
};