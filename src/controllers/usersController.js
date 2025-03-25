import db from '../db/database.js'

const AUTH_SERVICE_URL = 'http://localhost:3002';

export const usersController = {
    
    async initUsersTable (request, reply) {
        const { userId } = request.body
        console.log('\x1b[1m\x1b[42m\x1b[30m%s\x1b[0m', `${userId} entered tournament-service`);

        try {
            const response = await fetch(`${AUTH_SERVICE_URL}/matchmaking`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: userId })
            })
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
            const userdata = await response.json()
            console.log(userdata)
            const insertUsers = db.prepare(`
                INSERT INTO users
                (user_id, display_name, avatar)
                VALUES(?, ?, ?)
            `)
            
            const result = insertUsers.run(
                userId,
                userdata.display_name,
                userdata.avatar
            );
            console.log(`User inserted in Position: ${result.lastInsertRowid}`);

            reply.code(201).send({ 
                message: 'User data saved successfully', 
                usersPos: result.lastInsertRowid 
            });
        }
        catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Failed to fetch user data from user management service' });
        }
    }
}
