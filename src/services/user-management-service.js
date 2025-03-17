import fetch from "node-fetch";

const sendIdToUserManagement = async (userId) => {
    const response = await fetch("http://localhost:3002/new-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
    });

    if (!response.ok) {
        console.error("Error creating user:", await response.text());
				return { error: "Failed to create user in User Management Service" };
    }

		return { success: "User created successfully in User Management Service" };
};

export default sendIdToUserManagement;