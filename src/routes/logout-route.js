import logoutService from "../services/logout-service.js";
import verifyToken from "jwt-validator-tr";

const logoutRoute = {
  method: "POST",
	url: "/logout",
	response: {
		200: {
			type: "object",
			properties: {
				success: { type: "string" }
			}
		}
	},
	preHandler: verifyToken,
	handler: logoutService
};

export default logoutRoute;