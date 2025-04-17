import jwtTr from "jwt-validator-tr";
import authenticationController from "../../controllers/authentication-controller.js";

export default async function (fastify, opts) {
	fastify.route({
		method: "POST",
		url: "/two-factor-authentication/app/add",
		schema: {
			response: {
				200: {
					type: "object",
					properties: {
						success: { type: "string" },
						qrCode: { type: "string" },
						route: { type: "string" }
					},
					required: ["success", "qrCode", "route"]
				},
				404: {
					type: "object",
					properties: {
						error: { type: "string" }
					},
					required: ["error"]
				},
				400: {
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
		handler: authenticationController.addAuthenticatorApp
	});
};
