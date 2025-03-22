import verifyEmailController from "../controllers/verify-email-controller.js";

export default async function (fastify, opts) {
	fastify.route({
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
	});
};
