import jwtTr from "jwt-validator-tr";
import authenticationController from "../../controllers/authentication-controller.js";

export default async function (fastify, opts) {
	fastify.route({
		method: "POST",
		url: "/add-phone-number",
		schema: {
			body : {
				type: "object",
				properties: {
					phoneNumber: {
						type: "string",
						pattern: "^\\+[0-9]{6,15}$"
					},
				},
				required: ["phoneNumber"]
			},
			response: {
				200: {
					type: "object",
					properties: {
						success: { type: "string" }
					},
					required: ["success"]
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
		handler: authenticationController.addPhoneNumber
	});
};
