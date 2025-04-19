import jwtTr from "jwt-validator-tr";
import frontendController from "../../controllers/frontend-controller.js";

export default async function (fastify, opts) {
	fastify.route({
		method: "GET",
		url: "/ws",
		wsHandler: frontendController.websocketConnections,
		handler: (request, reply) => {
			reply.send({ message: "This is a WebSocket endpoint" });
		}
	});
};