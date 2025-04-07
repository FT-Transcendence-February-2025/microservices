import db from "./database-service.js";
import userDataValidator from "../validation/validator.js";

const emailService = {
	changeEmail: async (user, newEmail) => {
		if (user.email === newEmail) {
			return { status: 400, error: "New email must be different from the current email" };
		}

    const emailValidationResult = await userDataValidator.email(newEmail);
		if (!emailValidationResult.valid) {
			return { status: emailValidationResult.status, error: emailValidationResult.error };
    }

		const updateResult = await db.updateEmail(userId, newEmail);
		if (updateResult.error) {
			return { status: 500, error: "Internal Server Error" };
		}

		return { success: "Email has been changed" };
	}
};

export default emailService;