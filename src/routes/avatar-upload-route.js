import { avatarUploadController } from '../controllers/avatar-upload-controller.js';

export const createAvatarUploadRoute = {
	method: 'POST',
	url: '/avatar',
	handler: avatarUploadController
};