import refreshTokenController from "../../controllers/refresh-token-controller.js";

const refreshTokenRoute = {
	method: "POST",
	url: "/refresh",
	response: {
		200: {
			type: "object",
			properties: {
				token: { type: "string" }
			}
		}
	},
	handler: refreshTokenController
}

export default refreshTokenRoute;
