import jwtTr from "jwt-validator-tr";
import notifyController from "../../controllers/notify-controller.js";

export default async function (fastify, opts) {
	fastify.route({
		method: "POST",
		url: "/data-change-request",
		schema: {
			body: {
				type: "object",
				properties: {
					email: { type: "string" },
					action: {
						type: "string",
						enum: ["email_change", "password_change"]
					}
				},
				required: ["email", "action"]
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
		handler: notifyController.sendCodeDataChange
	});
};