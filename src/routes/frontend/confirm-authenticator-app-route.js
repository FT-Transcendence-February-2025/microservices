import jwtTr from "jwt-validator-tr";
import authenticationController from "../../controllers/authentication-controller.js";

export default async function (fastify, opts) {
	fastify.route({
		method: "POST",
		url: "/two-factor-authentication/app/confirm",
		schema: {
			body: {
				type: "object",
				properties: {
					verificationCode: {
						type: "string",
						pattern: "^[0-9]{6}$"
					}
				},
				required: ["verificationCode"]
			},
			response: {
				200: {
					type: "object",
					properties: {
						success: { type: "string" },
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
		handler: authenticationController.confirmAuthenticatorApp
	});
};
