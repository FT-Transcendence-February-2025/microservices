import db from './database.js'
import config from '../config/config.js';

const UM_SERVICE_URL = `${config.endpoints.user}`;

export const userService = {
    async addUser(userId){
        try {
            const response = await fetch(`${UM_SERVICE_URL}/get-user/${userId} `, {
                method: 'GET'
            })
            if (!response.ok) {
                const userdata = await response.json()
                console.log(userdata)
                const error = new Error(`User not found`);
                error.statusCode = response.status;
                throw error;
            }
            const userExists = db.prepare('SELECT user_id FROM users WHERE user_id = ?').get(userId)
            if (userExists) {
                console.log(`USER: ${JSON.stringify(userExists)}`)
                const error = new Error(`User already exists`);
                error.statusCode = 409;
                throw error;
            }
            const userdata = await response.json()
            // console.log(userdata)

            const insertUsers = db.prepare(`
                INSERT INTO users
                (user_id, display_name, avatar)
                VALUES(?, ?, ?)
            `);
            
            const result = insertUsers.run(
                userId,
                userdata.displayName,
                userdata.avatarPath
            );
            console.log(`User inserted in Position: ${result.lastInsertRowid}`);
            return {
                success: true,
                message: 'User saved successfully', 
                usersPos: result.lastInsertRowid
            }
        }
        catch (error) {
            console.log(`Failed to add User`);
            return {
                success: false,
                message: error.message,
                statusCode: error.statusCode || 500
            }
        }
    }
}