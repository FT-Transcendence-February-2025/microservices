import fastify from "../server.js";
import db from "./database-service.js";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

const notifyService = {
  sendEmail: async ({ settings , receiver }) => {
    const { mailer } = fastify;
		let accessGate, options;
		switch (settings.type) {
			case "emailConfirm":
				accessGate = `http://localhost:3001/verify-email/${
					generateConfirmationToken(settings.userId, settings.type, 10)
				}`;
				options = generateEmailConfirmationOptions(receiver, accessGate);
				break;
			case "code":
				accessGate = generateEmailCode(receiver, settings.dataToChange);
				if (accessGate.error) {
					return { status: accessGate.status, error: accessGate.error };
				}
				options = generateEmailCodeOptions(receiver, accessGate.code);
				break;
			default:
        fastify.log.error(`Unknown email type: ${settings.type}`);
        return { status: 400, error: "Invalid email type" };
		}
    try {
      await mailer.sendMail(options);
      return { success: "Email sent" };
    } catch (error) {
			console.error("Error in function sendEmail: ", error);
      return { status: 500, error: "Something went wrong" };
    }
  },
	verifyConfirmationToken: (token, action) => {
		try {
			const [identifier, userId, receivedSignature, timestamp, expirationMinutes] = token.split("-");
	
			const currentTime = Math.floor(Date.now() / 1000);
			if (currentTime > parseInt(timestamp) + parseInt(expirationMinutes) * 60) {
				return { error: "Confirmation link expired" };
			}
	
			const hmac = crypto.createHmac("sha256", process.env.SECRET_KEY);
			hmac.update(`${identifier}:${userId}:${action}:${timestamp}:${expirationMinutes}`);
			const expectedSignature = hmac.digest("hex").substr(0, 8);
	
			if (receivedSignature === expectedSignature) {
				return { userId };
			}
		} catch (error) {
			console.error(error);
			return { error };
		}
	},
	sendSms: async (userId, phoneNumber) => {
		const { code, error, status } = generateAuthCode(userId, "sms");
    if (error) {
      return { status, error };
    }
		const response = await fetch(`${process.env.INFOBIP_BASE_URL}/sms/2/text/advanced`, {
			method: "POST",
			headers: {
				"Authorization": `App ${process.env.INFOBIP_API_KEY}`,
				"Content-Type": "application/json",
				"Accept": "application/json"
			},
			body: JSON.stringify({
				messages: [
					{
						destinations: [{ to: phoneNumber }],
						from: process.env.INFOBIP_SENDER_ID,
						text: `${code} is your Pong verification code.`
					}
				]
			})
		});
		if (!response.ok) {
			console.error(`Error in function notifyService.sendSms: ${response.status} ${response.statusText}`);
			return { status: response.status, error: "Failed to send SMS" };
		}
		
		return { success: true };
	}
};

const generateConfirmationToken = (userId, action, expirationMinutes) => {
	const identifier = uuidv4().split("-")[0];
	const timestamp = Math.floor(Date.now() / 1000);

	const hmac = crypto.createHmac("sha256", process.env.SECRET_KEY);

	hmac.update(`${identifier}:${userId}:${action}:${timestamp}:${expirationMinutes}`);
	const signature = hmac.digest("hex").substr(0, 8);

	return `${identifier}-${userId}-${signature}-${timestamp}-${expirationMinutes}`;
};

const generateEmailCode = (email, dataToChange) => {
	const code = Math.floor(100000 + Math.random() * 900000).toString();
	const expiresAt = Math.floor(Date.now() / 1000 + 10 * 60);
	const addResult = db.addEmailCode(email, code, expiresAt, dataToChange);
	if (addResult.error) {
		return { error: "Internal Server Error", status: 500 };
	}

	return { code };
};

const generateAuthCode = (userId, type) => {
	const code = Math.floor(100000 + Math.random() * 900000).toString();
	const expiresAt = Math.floor(Date.now() / 1000 + 5 * 60);
	const addResult = db.addAuthCode(userId, code, expiresAt, type);
	if (addResult.error) {
		return { error: "Internal Server Error", status: 500 };
	}

	return { code };
};

const generateEmailConfirmationOptions = (receiver, confirmationLink) => ({
  to: receiver,
  subject: "Confirm your email address",
  html: `
    <p>Please confirm your email address by clicking on the link below.</p>
    <p>
        <a href="${confirmationLink}" style="
            display: inline-block;
            cursor: pointer;
            font-family: "Press Start 2P", monospace;
            font-size: 14px;
            text-transform: uppercase;
            border-radius: 12px;
            border-bottom: 6px solid #db2777; /* --color-pink-800 */
            border-top: 4px solid #ec4899;
            background-color: #ec4899; /* --color-pink-600 */
            padding: 12px 24px; /* Bigger button */
            color: black;
            text-decoration: none;
            box-shadow: 4px 4px 0px black;
            transition: all 150ms ease-in-out;
        ">Confirm Email</a>
    </p>
    <p>If you cannot remember submitting your email address on our website or in our app, simply ignore this email.</p>
  `
});

const generateEmailCodeOptions = (receiver, code) => ({
  to: receiver,
  subject: "Confirmation code",
  html: `
    <p>Here is the code you need to use to change your login data:</p>
    <p style="
        display: inline-block;
        cursor: default;
        font-family: "Press Start 2P", monospace;
        font-size: 14px;
        text-transform: uppercase;
        border-radius: 12px;
        border-bottom: 6px solid #db2777; /* --color-pink-800 */
        border-top: 4px solid #ec4899;
        background-color: #ec4899; /* --color-pink-600 */
        padding: 12px 24px; /* Bigger button */
        color: black;
        text-decoration: none;
        box-shadow: 4px 4px 0px black;
        transition: all 150ms ease-in-out;
    ">
        ${code}
    </p>
    <p>If you cannot remember submitting your email address on our website or in our app, simply ignore this email.</p>
  `
});

export default notifyService;
