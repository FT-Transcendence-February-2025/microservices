import config from '../config/config.js';

const userManagementService = {
	getUser: async (userId) => {
		const response = await fetch(`http://localhost:3002/get-user/${userId}`, {
			method: "GET",
			headers: { "Content-Type": "application/json" },
		});

		if (!response.ok) {
			console.error("Error in function userManagementService.getUser:", response.status, response.statusText);
			return { error: "Failed to get user from User Management Service" };
		}

		const data = await response.json();
		return data;
	},
	displayNameExists: async (displayName) => {
		const response = await fetch(`${config.endpoints.user}/user-exists`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ displayName })
		});

		if (!response.ok) {
			console.error("Error in function userManagementService.displayNameExists:", response.status, response.statusText);
			return { error: "Failed to check display name in User Management Service" };
		}

		const data = await response.json();
		return { exists: data.exists };
	},
	sendId: async (userId, displayName) => {
    const response = await fetch(`${config.endpoints.user}/new-user`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ userId, displayName })
    });

    if (!response.ok) {
			console.error("Error in function userManagementService.sendId:", response.status, response.statusText);
			return { error: "Failed to create user in User Management Service" };
    }

		return { success: "User created successfully in User Management Service" };
	},
	informUserLogout: async (userId) => {
		const response = await fetch (`${config.endpoints.user}/user-logout`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ userId })
		});

		if (!response.ok) {
			console.error("Error in function userManagementService.informUserLogout:", response.status, response.statusText);
			return { error: "Failed to inform user management about user logout" };
		}
	}
};

export default userManagementService;