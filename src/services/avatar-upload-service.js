import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { pipeline } from "stream/promises";
import db from "./database-service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, "../uploads/avatars");

const avatarUploadService = {
	uploadAvatar: async (file, userId) => {
    const validationResult = this.validateFile(file);
    if (validationResult.error) {
      return validationResult;
    }
    await this.ensureUploadsDirExists();
    const filePath = await this.saveFile(file, userId);
		if (filePath.error) {
      console.error("Error uploading avatar:", filePath.error);
			return { error: filePath.error };
		}
    return { filePath };
  },

  config: {
    allowedMimeTypes: ["image/jpg", "image/jpeg", "image/png"],
    maxSize: 5 * 1024 * 1024,
    uploadDir: UPLOAD_DIR
  },

	validateFile: (file) => {
    if (!this.config.allowedMimeTypes.includes(file.mimetype)) {
      return { error: "Invalid file type. Only JPG, JPEG, PNG are allowed." };
    }

    if (file.size > this.config.maxSize) {
      return { error: "File size exceeds the 5MB limit." };
    }

    return { success: true };
  },

	ensureUploadsDirExists: async () => {
    if (!fs.existsSync(this.config.uploadDir)) {
      await fs.mkdir(this.config.uploadDir, { recursive: true });
    }
  },

	saveFile: async (file, userId) => {
	  const fileExtension = path.extname(file.filename);
	  const uniqueFileName = `${userId}-${Date.now()}${fileExtension}`;
	  const filePath = path.join(this.config.uploadDir, uniqueFileName);

	  const writeStream = fs.createWriteStream(filePath);

	  try {
      await pipeline(file.file, writeStream);

      const updateResult = await db.updateAvatarPath(userId, filePath);
			if (updateResult.error) {
        return { error: "File size exceeds the 5MB limit." };
			}

      return filePath;
	  } catch (error) {
      await fs.remove(filePath).catch(console.error);
      return { error };
	  }
	}
};

export default avatarUploadService;