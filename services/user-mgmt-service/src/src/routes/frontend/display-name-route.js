import frontendController from "../../controllers/frontend-controller.js";
import jwtTr from "jwt-validator-tr";

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
	preHandler: jwtTr.verifyAccessToken,
	handler: frontendController.displayName
};

export default displayNameRoute;