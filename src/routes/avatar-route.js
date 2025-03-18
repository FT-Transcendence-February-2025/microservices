import avatarController from "../controllers/avatar-controller.js";
import verifyToken from "jwt-validator-tr";

export const avatarRoute = {
	method: "POST",
	url: "/avatar",
	preHandler: verifyToken,
	handler: avatarController
};

export default avatarRoute;