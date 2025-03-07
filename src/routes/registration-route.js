import registrationController from "../controllers/registration-controller.js";

const registrationRoute = {
  method: "POST",
  url: "/register",
  schema: {
    body: {
      type: "object",
      properties: {
        email: { type: "string" },
        displayName: { type: "string" },
        password: { type: "string" }
      },
      required: ["email", "displayName", "password"]
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
  handler: registrationController
};

export default registrationRoute;