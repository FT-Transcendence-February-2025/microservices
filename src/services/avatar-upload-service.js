import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { pipeline } from "stream/promises";
import db from "./database-service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, "../uploads/avatars");

const avatarUploadService = {
	async uploadAvatar(file, userId) {
    try {
      const validationResult = this.validateFile(file);
      if (!validationResult.success) {
        return validationResult;
      }

      await this.ensureUploadsDirExists();

      const filePath = await this.saveFile(file, userId);

      return {
        success: true,
        filePath
      };
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return {
      success: false,
      error: "Error while saving avatar"
    };
    }
  },

  config: {
    allowedMimeTypes: ["image/jpg", "image/jpeg", "image/png"],
    maxSize: 5 * 1024 * 1024, // 5MB
    uploadDir: UPLOAD_DIR
  },

  validateFile(file) {
    if (!this.config.allowedMimeTypes.includes(file.mimetype)) {
      return {
        success: false,
        error: "Invalid file type. Only JPG, JPEG, PNG are allowed."
      };
    }

    if (file.size > this.config.maxSize) {
      return {
        success: false,
        error: "File size exceeds the 5MB limit."
      };
    }

    return { success: true };
  },

  async ensureUploadsDirExists() {
    if (!fs.existsSync(this.config.uploadDir)) {
      await fs.mkdir(this.config.uploadDir, { recursive: true });
    }
  },

  async saveFile(file, userId) {
	  const fileExtension = path.extname(file.filename);
	  const uniqueFileName = `${userId}-${Date.now()}${fileExtension}`;
	  const filePath = path.join(this.config.uploadDir, uniqueFileName);

	  const writeStream = fs.createWriteStream(filePath);

	  try {
      await pipeline(file.file, writeStream);

      await db.updateAvatarPath(userId, filePath);

      return filePath;
	  } catch (error) {
      await fs.remove(filePath).catch(console.error);
      throw error;
	  }
	}
};

export default avatarUploadService;