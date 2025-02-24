import validator from 'validator'
import { Filter } from 'bad-words'
import zxcvbn from 'zxcvbn'
import { getUserByEmail, getUserByDisplayName } from '../services/database-service.js';

const filter = new Filter();

export const emailValidator = async (email) => {
  if (!validator.isEmail(email)) {
    return { valid: false, error: 'Invalid email address', code: '400' };
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return { valid: false, error: 'Email already in use', code: '400' };
  }

  return { valid: true };
};

export const displayNameValidator = async (displayName) => {
  if (displayName.length < 4) {
    return { valid: false, error: 'Display name too short (min 4 characters)', code: '400' };
  }

  if (displayName.length > 25) {
    return { valid: false, error: 'Display name too long (max 25 characters)', code: '400' };
  }

  if (filter.isProfane(displayName)) {
    return { valid: false, error: 'Display name contains profane words', code: '400' };
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(displayName)) {
    return { valid: false, error: 'Display name contains invalid characters', code: '400' };
  }

  if (!/[a-zA-Z]/.test(displayName)) {
    return { valid: false, error: 'Display name must contain at least one letter', code: '400' };
  }

	let existingUser = {};
	try {
		existingUser = await getUserByDisplayName(displayName);
	} catch (error) {
		console.error(error);
		return { valid: false, error: 'Internal Server Error', code: '500' };
	}
  if (existingUser) {
    return { valid: false, error: 'Display name already in use', code: '400' };
  }

  return { valid: true };
};

export const passwordValidator = async (password, email, displayName, currentPassword = "") => {
  if (password.length < 8) {
    return { valid: false, error: 'Password too short (min 8 characters)', code: '400' };
  }

  if (password.length > 64) {
    return { valid: false, error: 'Password too long (max 64 characters)', code: '400' };
  }

  if (!/[a-z]/.test(password) ||
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter, one uppercase letter, ' +
          'one digit, and one special character', code: '400' };
  }

  if (password.toLowerCase().includes(email.toLowerCase()) ||
      password.toLowerCase().includes(displayName.toLowerCase())) {
    return { valid: false, error: 'Password should not contain your email or display name', code: '400' };
  }

	if (currentPassword && currentPassword === password) {
		return { valid: false, error: 'Your new password cannot be the same as your old password', code: '400' };
	}

  const strengthValidator = currentPassword ? zxcvbn(password, [currentPassword]) : zxcvbn(password);
  if (strengthValidator.score < 3) {
    return { valid: false, error: 'Password too weak', code: '400' };
  }

  return { valid: true };
};