import passwordController from "../controllers/password-controller.js";
import verifyToken from "jwt-validator-tr";

const passwordRoute = {
	method: "POST",
	url: "/password",
	schema: {
		body: {
			type: "object",
			properties: {
				currentPassword: { type: "string" },
				newPassword: { type: "string" }
			},
			required: ["currentPassword", "newPassword"]
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
	handler: passwordController
};

export default passwordRoute;