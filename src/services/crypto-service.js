import crypto from "node:crypto";

const key = Buffer.from(process.env.ENCRYPTION_KEY, "hex");

const cryptoService = {
  encrypt: (data) => {
    try {
      if (typeof data !== "string") {
        return { error: "Data to encrypt must be a string" };
      }

      const algorithm = "aes-256-gcm";
      const initializationVector = crypto.randomBytes(12);

      const cipher = crypto.createCipheriv(algorithm, key, initializationVector);
      let encrypted = cipher.update(data, "utf8", "hex");
      encrypted += cipher.final("hex");
      const authTag = cipher.getAuthTag().toString("hex");

      return { encrypted, initializationVector: initializationVector.toString("hex"), authTag };
    } catch (error) {
      console.error("Error in function cryptoService.encrypt:", error);
			return { error };
    }
  },
	decrypt: (encrypted, initializationVector, authTag) => {
		try {
			const algorithm = "aes-256-gcm";
			const decipher = crypto.createDecipheriv(algorithm, key, initializationVector);
			decipher.setAuthTag(Buffer.from(authTag, "hex"));
			let decrypted = decipher.update(encrypted, "hex", "utf8");
			decrypted += decipher.final("utf8");
	
			return { decrypted };
		} catch (error) {
			console.error("Error in function cryptoService.decrypt:", error);
			return { error };
		}
	}
};

export default cryptoService;
