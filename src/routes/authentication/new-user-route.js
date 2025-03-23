import authenticationController from "../../controllers/authentication-controller.js";

const displayNameRoute = {
	method: "POST",
	url: "/new-user",
	schema: {
		body: {
			type: "object",
			properties: {
				userId: {
					type: "number",
					multipleOf: 1
				},
				displayName: { type: "string" }
			},
			required: ["userId", "displayName"]
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
	handler: authenticationController.newUser
};

export default displayNameRoute;