import { avatarUploadService } from '../services/avatar-upload-service.js';

export const avatarUploadController = async (request, reply) => {
	try {
		const data = await request.file();
		if (!data) {
			return reply.status(400).send({ error: 'No file uploaded' });
		}

		const allowedMimeTypes = ['image/jpg', 'image/jpeg', 'image/png'];
		const maxSize = 5 * 1024 * 1024;

		if (!allowedMimeTypes.includes(data.mimetype)) {
			return reply.status(400).send({ error: 'Invalid file type. Only JPG, JPEG, PNG are allowed.' });
		}

		if (data.size > maxSize) {
			return reply.status(400).send({ error: 'File size exceeds the 5MB limit.' });
		}

		const filePath = await avatarUploadService(data);

		return reply.status(200).send({ success: 'Avatar uploaded successfully', filePath });
	} catch (error) {
		reply.status(500).send({ error: 'Something went wrong' });
	}
};