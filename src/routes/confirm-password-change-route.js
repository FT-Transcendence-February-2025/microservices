import passwordController from "../controllers/password-controller.js";
import verifyEmailController from "../controllers/verify-email-controller.js";

export default async function (fastify, opts) {
	fastify.route({
		method: "GET",
		url: "/confirm-password-change/:token",
		response: {
			200: {
				type: "object",
				properties: {
					success: { type: "string" }
				},
				required: ["success"]
			}
		},
		handler: passwordController
	});
};
