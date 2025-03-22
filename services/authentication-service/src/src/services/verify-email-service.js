import db from "./database-service.js";
import crypto from "crypto";

const verifyEmailService = {
	setUserAsVerified: async (token) => {
		const verificationResult = verifyConfirmationToken(token, "email_confirmation");
		if (verificationResult.error) {
			return { status: 401, error: verificationResult.error };
		}

		const updateResult = await db.updateEmailVerified(verificationResult.userId, true);
		if (updateResult.error) {
			return { status: 500, error: updateResult.error };
		}

		return { success: "Email verified" };
	}
};

const verifyConfirmationToken = (token, action) => {
  try {
    const [identifier, userId, receivedSignature, timestamp, expirationMinutes] = token.split('-');

    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime > parseInt(timestamp) + parseInt(expirationMinutes) * 60) {
      return { error: "Confirmation link expired" };
    }

    const hmac = crypto.createHmac('sha256', process.env.SECRET_KEY);
    hmac.update(`${identifier}:${userId}:${action}:${timestamp}:${expirationMinutes}`);
    const expectedSignature = hmac.digest('hex').substr(0, 8);

    if (receivedSignature === expectedSignature) {
			return { userId };
    }
  } catch (error) {
		console.error(error);
    return { error };
  }
}

export default verifyEmailService;