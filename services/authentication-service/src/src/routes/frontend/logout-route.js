import jwtTr from "jwt-validator-tr";
import logoutController from "../../controllers/logout-controller.js";

export default async function (fastify, opts) {
	fastify.route({
		method: "POST",
		url: "/logout",
		response: {
			200: {
				type: "object",
				properties: {
					success: { type: "string" }
				}
			}
		},
		preHandler: jwtTr.verifyAccessToken,
		handler: logoutController
	});
};
