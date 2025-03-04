import { avatarUploadController } from '../controllers/avatar-upload-controller.js';

export const avatarUploadRoute = {
	method: 'POST',
	url: '/avatar',
	handler: avatarUploadController
};