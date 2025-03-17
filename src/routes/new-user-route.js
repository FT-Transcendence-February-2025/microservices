import newUserController from "../controllers/new-user-controller.js";

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
				}
			},
			required: ["userId"]
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
	handler: newUserController
};

export default displayNameRoute;