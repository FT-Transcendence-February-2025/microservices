import authenticationController from "../../controllers/authentication-controller.js"

const userExistsRoute = {
	method: "POST",
	url: "/user-exists",
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
					exists: { type: "boolean" }
				}
			}
		}
	},
	handler: authenticationController.userExists
};

export default userExistsRoute;