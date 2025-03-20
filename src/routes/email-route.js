import emailController from "../controllers/email-controller.js";
import verifyToken from "jwt-validator-tr";

export default async function (fastify, opts) {
  fastify.route({
    method: "POST",
    url: "/email",
    schema: {
      body: {
        type: "object",
        properties: {
          email: { type: "string" }
        },
        required: ["email"]
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
    preHandler: verifyToken, // Middleware to verify token before the handler
    handler: emailController
  });
}