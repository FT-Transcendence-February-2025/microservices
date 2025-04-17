import jwtTr from "jwt-validator-tr";
import authenticationController from "../../controllers/authentication-controller.js";

export default async function (fastify, opts) {
	fastify.route({
		method: "POST",
		url: "/two-factor-authentication/change-mode",
		schema: {
			body: {
				type: "object",
				properties: {
					mode: {
						type: "string",
						enum: ["off", "sms", "email", "app"]
					}
				},
				required: ["mode"]
			},
			response: {
				200: {
					type: "object",
					properties: {
						success: { type: "string" }
					},
					required: ["success"]
				},
				400: {
					type: "object",
					properties: {
						error: { type: "string" }
					},
					required: ["error"]
				},
				404: {
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
		handler: authenticationController.changeTwoFactorAuthMode
	});
};