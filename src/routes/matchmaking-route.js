import matchmakingController from "../controllers/matchmaking-controller.js";

const matchmakingRoute = {
	method: "POST",
	url: "/matchmaking",
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
					success: { type: "string" },
					displayName: { type: "string" }
				}
			}
		}
	},
	handler: matchmakingController
};

export default matchmakingRoute;