import jwtTr from "jwt-validator-tr";
import authenticationController from "../../controllers/authentication-controller.js";

export default async function (fastify, opts) {
	fastify.route({
		method: "POST",
		url: "/two-factor-authentication/app/delete",
		schema: {
			response: {
				200: {
					type: "object",
					properties: {
						success: { type: "string" },
						token: { type: "string" }
					},
					required: ["success"]
				},
				404: {
					type: "object",
					properties: {
						error: { type: "string" }
					},
					required: ["error"]
				},
				410: {
					type: "object",
					properties: {
						error: { type: "string" }
					},
					required: ["error"]
				},
				500: {
					type: "object",
					properties: {
						error: { type: "string" }
					},
					required: ["error"]
				}
			}
		},
		preHandler: jwtTr.verifyAccessToken,
		handler: authenticationController.deleteAuthenticatorApp
	});
};
