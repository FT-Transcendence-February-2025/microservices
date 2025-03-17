import { Filter } from "bad-words";
import db from "./database-service.js";

const filter = new Filter();

const displayNameService = {
	changeDisplayName: async (userId, newDisplayName) => {
		const user = await db.getUser(userId);
		if (!user) {
			return {status: 404, error: "User not found"};
		}
		if (user.error) {
			return {status: 500, error: "Internal Server Error"};
		}
		const validationResult = await displayNameValidator(user.display_name, newDisplayName);
		if (validationResult.error) {
			return {status: validationResult.status, error: validationResult.error};
		}

		const updateResult = await db.updateDisplayName(user.id, newDisplayName);
		if (updateResult.error) {
			return {status: 500, error: "Internal Server Error"};
		}

		return {success: "Display name changed"};
	}
};

const displayNameValidator = async (currentDisplayName, newDisplayName) => {
	 if (newDisplayName.length < 4) {
    return { error: "Display name too short (min 4 characters)", status: "400" };
  }

  if (newDisplayName.length > 25) {
    return { error: "Display name too long (max 25 characters)", status: "400" };
  }

  if (filter.isProfane(newDisplayName)) {
    return { error: "Display name contains profane words", status: "400" };
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(newDisplayName)) {
    return { error: "Display name contains invalid characters", status: "400" };
  }

  if (!/[a-zA-Z]/.test(newDisplayName)) {
    return { error: "Display name must contain at least one letter", status: "400" };
  }

	if (newDisplayName === currentDisplayName) {
    return { error: "Your new display name cannot be the same as your old display name", status: "400" };
	}

	const existingUser = await db.getUser(newDisplayName);
	if (existingUser) {
		if (existingUser.error) {
			return { error: "Internal Server Error", status: "500" };
		}
    return { error: "Display name already in use", status: "400" };
  }

  return { success: true };
};

export default displayNameService;