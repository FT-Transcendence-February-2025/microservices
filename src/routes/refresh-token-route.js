import refreshTokenController from "../controllers/refresh-token-controller.js";

export default async function (fastify, opts) {
	fastify.route({
		method: "POST",
		url: "/refresh",
		response: {
			200: {
				type: "object",
				properties: {
					token: { type: "string" }
				}
			}
		},
		handler: refreshTokenController
	});
};
