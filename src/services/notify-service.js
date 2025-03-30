import fastify from "../server.js";

const notifyService = {
  sendEmail: async ({ type, receiver, link }) => {
    const { mailer } = fastify;
		let options;
		switch (type) {
			case "confirm":
				options = generateEmailConfirmationOptions(receiver, link);
				break;
			default:
        fastify.log.error(`Unknown email type: ${type}`);
        return { status: 400, error: "Invalid email type" };
		}
    try {
      await mailer.sendMail(options);
      return { success: "Email sent" };
    } catch (error) {
			console.error("Error in function sendEmail: ", error);
      return { status: 500, error: "Something went wrong" };
    }
  }
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
            font-family: 'Press Start 2P', monospace;
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


// const notifyService = {
//   sendEmail: async (receiver, subject, message) => {
//     const { mailer } = fastify;
// 		console.log(fastify);
//
//     try {
//       await mailer.sendMail({
//         to: receiver,
//         subject,
//         text: message
//       });
//
//       return { success: "Email sent" };
//     } catch (error) {
//       fastify.log.error(error);
//       return { status: 500, error: "Something went wrong" };
//     }
//   }
// };

export default notifyService;