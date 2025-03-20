import validator from "validator";
import { Filter } from "bad-words";
import zxcvbn from "zxcvbn";
import db from "../services/database-service.js";

const filter = new Filter();


const userDataValidator = {
	email: async (email) => {
	  if (!validator.isEmail(email)) {
	    return { valid: false, error: "Invalid email address", status: "400" };
	  }

	  const existingUser = await db.getUserByEmail(email);
	  if (existingUser) {
	    return { valid: false, error: "Email already in use", status: "400" };
	  }

	  return { valid: true };
	},

	password: async (password, email, currentPassword = "") => {
	  if (password.length < 8) {
	    return { valid: false, error: "Password too short (min 8 characters)", status: "400" };
	  }

	  if (password.length > 64) {
	    return { valid: false, error: "Password too long (max 64 characters)", status: "400" };
	  }

	  if (!/[a-z]/.test(password) ||
	      !/[A-Z]/.test(password) ||
	      !/[0-9]/.test(password) ||
	      !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
	    return { valid: false, error: "Password must contain at least one lowercase letter, one uppercase letter, " +
	          "one digit, and one special character", status: "400" };
	  }

	  if (password.toLowerCase().includes(email.toLowerCase())) {
	    return { valid: false, error: "Password should not contain your email", status: "400" };
	  }

		if (currentPassword && currentPassword === password) {
			return { valid: false, error: "Your new password cannot be the same as your old password", status: "400" };
		}

	  const strengthValidator = currentPassword ? zxcvbn(password, [currentPassword]) : zxcvbn(password);
	  if (strengthValidator.score < 3) {
	    return { valid: false, error: "Password too weak", status: "400" };
	  }

	  return { valid: true };
	}
};

export default userDataValidator;