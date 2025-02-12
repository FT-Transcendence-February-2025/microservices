import validator from 'validator'
import { getUserByEmail, getUserByDisplayName } from '../services/user_service';

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
