import emailController from "../controllers/email-controller.js";
import jwtTr from "jwt-validator-tr";

const emailRoute = {
	method: "POST",
	url: "/email",
	schema: {
		body: {
			type: "object",
			properties: {
				email: { type: "string" }
			},
			required: ["email"]
		},
		response: {
			200: {
				type: "object",
				properties: {
					success: { type: "string" }
				}
			}
		}
	},
	preHandler: jwtTr.verifyAccessToken,
	handler: emailController
};

export default emailRoute;