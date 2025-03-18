import passwordController from "../controllers/password-controller.js";
import verifyToken from "jwt-validator-tr";

export default async function (fastify, opts) {
  fastify.route({
    method: "POST",
    url: "/password", // Fixed the typo in the URL
    schema: {
      body: {
        type: "object",
        properties: {
          currentPassword: { type: "string" },
          newPassword: { type: "string" }
        },
        required: ["currentPassword", "newPassword"]
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
    preHandler: verifyToken, // Middleware for token verification
    handler: passwordController // Controller that handles password update logic
  });
}
