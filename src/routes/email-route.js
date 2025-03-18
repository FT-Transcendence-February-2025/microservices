import emailController from "../controllers/email-controller.js";
import verifyToken from "jwt-validator-tr";

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
	preHandler: verifyToken,
	handler: emailController
};

export default emailRoute;