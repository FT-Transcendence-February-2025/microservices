import matchmakingController from "../../controllers/matchmaking-controller.js";

export default async function (fastify, opts) {
	fastify.route({
		method: "POST",
		url: "/invite-game",
		schema: {
			body: {
				type: "object",
				properties: {
					invitingId: {
						type: "number",
						multipleOf: 1
					},
					invitedId: {
						type: "number",
						multipleOf: 1
					}
				},
				required: ["invitedId"]
			},
			response: {
				200: {
					type: "object",
					properties: {
						success: { type: "string" },
						invitationSent: { type: "boolean" }
					},
					required: ["success", "invitationSent"]
				},
				404: {
					type: "object",
					properties: {
						error: { type: "string" }
					},
					required: ["error"]
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
		handler: matchmakingController.inviteUserToGame
	});
};