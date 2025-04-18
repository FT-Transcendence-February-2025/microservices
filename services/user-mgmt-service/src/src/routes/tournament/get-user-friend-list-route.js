import tournamentController from "../../controllers/tournament-controller.js";

export default async function (fastify, opts) {
	fastify.route({
		method: "GET",
		url: "/get-user-friend-list/:userId",
		schema: {
			params: {
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
						friends: {
							type: "array",
							items: {
								type: "object",
								properties: {
									id: { type: "number" },
									displayName: { type: "string" },
									avatarPath: { type: "string" },
									wins: { type: "number" },
									loses: { type: "number" },
									online: { type: "boolean" }
								}
							}
						},
					},
					required: ["success", "friends"]
				},
				500: {
					type: "object",
					properties: {
						error: { type: "string" }
					},
					required: ["error"]
				}
			}
		},
		handler: tournamentController.getUserFriendList
	});
};
