import fs from 'fs-extra';
import path from 'path';
import { updateAvatarPath } from './database-service.js';
import { fileURLToPath } from 'url';  // Add this import

// Get the current directory path in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, '../uploads/avatars');

export const avatarUploadService = async (file, userId) => {
	try {
		ensureUploadsDirExists();

		const uniqueFileName = `${userId}-${file.filename}`;
		const filePath = path.join(UPLOAD_DIR, uniqueFileName);

		await fs.promises.writeFile(filePath, file.file);

		// Update avatar path in the database
		await updateAvatarPath(userId, filePath);

		return filePath;
	} catch (error) {
		console.error('Error uploading avatar:', error);
		throw new Error('Error while saving avatar');
	}
};

const ensureUploadsDirExists = () => {
	if (!fs.existsSync(UPLOAD_DIR)) {
		fs.mkdirSync(UPLOAD_DIR, { recursive: true });
	}
};
