import frontendController from "../../controllers/frontend-controller.js";
import jwtTr from "jwt-validator-tr";

export const avatarRoute = {
	method: "POST",
	url: "/avatar",
	preHandler: jwtTr.verifyAccessToken,
	handler: frontendController.avatar
};

export default avatarRoute;