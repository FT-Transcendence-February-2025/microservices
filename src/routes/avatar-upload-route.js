import { avatarUploadController } from "../controllers/avatar-upload-controller.js";
import verifyToken from "jwt-validator-tr";

export const avatarUploadRoute = {
	method: "POST",
	url: "/avatar",
	prehandler: verifyToken,
	handler: avatarUploadController
};

export default avatarUploadRoute;