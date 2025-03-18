import avatarService from "../services/avatar-service.js";

const avatarController = async (request, reply) => {
  try {
    const file = await request.file();
    if (!file) {
      return reply.status(400).send({ error: "No file uploaded" });
    }

    const result = await avatarService.uploadAvatar(file, request.user.id);
    if (result.error) {
      return reply.status(400).send({ error: result.error });
    }

    return reply.status(200).send({ success: "Avatar uploaded successfully", filePath: result.filePath });
	} catch (error) {
    console.error("Avatar upload error:", error);
    return reply.status(500).send({ error: "Something went wrong" });
  }
};

export default avatarController;
