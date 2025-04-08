import passwordController from "../../controllers/password-controller.js";
import jwtTr from "jwt-validator-tr";

export default async function (fastify, opts) {
	fastify.route({
		method: "POST",
		url: "/password",
		schema: {
			body: {
				type: "object",
				properties: {
					verificationCode: {
						type: "string",
						pattern: "^[0-9]{6}$"
					},
					newPassword: { type: "string" }
				},
				required: ["verificationCode", "newPassword"]
			},
			response: {
				200: {
					type: "object",
					properties: {
						success: { type: "string" }
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
		handler: passwordController.changePassword
	});
};
