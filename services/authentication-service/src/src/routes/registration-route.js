import registrationController from "../controllers/registration-controller.js";

export default async function (fastify, opts) {
  fastify.route({
    method: "POST",
    url: "/register",
    schema: {
      body: {
        type: "object",
        properties: {
          email: { type: "string" },
          password: { type: "string" }
        },
        required: ["email", "password"]
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
    handler: registrationController // Controller to handle the logic
  });
}
