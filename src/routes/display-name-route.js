import displayNameController from "../controllers/display-name-controller.js";
import verifyToken from "jwt-validator-tr";

const displayNameRoute = {
	method: "POST",
	url: "/display-name",
	schema: {
		body: {
			type: "object",
			properties: {
				displayName: { type: "string" }
			},
			required: ["displayName"]
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
	handler: displayNameController
};

export default displayNameRoute;