const authenticationService = {
	getUserEmailVerified: async (userId) => {
    const response = await fetch("http://localhost:3001/get-user-email-verified", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ userId })
    });

    if (!response.ok) {
			console.error("Error in function authenticationService.getUserEmailVerified:", response.error);
			console.error("Notification about user not verified was not sent.")
    }

		const data = await response.json();
		return data.verified;
	},
};

export default authenticationService;