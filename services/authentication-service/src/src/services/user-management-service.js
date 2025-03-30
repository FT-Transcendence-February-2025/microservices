const userManagementService = {
	displayNameExists: async (displayName) => {
		const response = await fetch("http://user:3002/api/user-exists", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ displayName })
		});


		if (!response.ok) {
			console.error("Error in function userManagementService.displayNameExists: Error validating display name");
			return { error: "Failed to check display name in User Management Service" };
		}

		const data = await response.json();
		return { exists: data.exists };
	},
	sendIdToUserManagement: async (userId, displayName) => {
    const response = await fetch("http://user:3002/api/new-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, displayName })
    });

    if (!response.ok) {
        console.error("Error in function userManagementService.sendIdToUserManagement: Error creating user in user management service:", response.error);
	return { error: "Failed to create user in User Management Service" };
    }

	return { success: "User created successfully in User Management Service" };
	}
};

export default userManagementService;