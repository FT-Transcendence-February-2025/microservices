import verifyEmailController from "../controllers/verify-email-controller.js";

const verifyEmailRoute = {
	method: "GET",
	url: "/verify-email/:token",
	response: {
		200: {
			type: "object",
			properties: {
				success: { type: "string" }
			}
		}
	},
	handler: verifyEmailController
};

export default verifyEmailRoute;