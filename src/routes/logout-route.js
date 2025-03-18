import verifyToken from "jwt-validator-tr";
import logoutController from "../controllers/logout-controller.js";

export default async function (fastify, opts) {
  fastify.route({
    method: "POST",
    url: "/logout",
    schema: {
      response: {
        200: {
          type: "object",
          properties: {
            success: { type: "string" }
          }
        }
      }
    },
    preHandler: verifyToken, // Middleware for token verification
    handler: logoutController // Controller that handles the logout logic
  });
}
