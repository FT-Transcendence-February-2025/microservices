import db from '../db/database.js'

const UM_SERVICE_URL = 'http://localhost:3002';

export const usersController = {

    async addUser (request, reply) {
        const { userId } = request.body
        console.log('\x1b[1m\x1b[42m\x1b[30m%s\x1b[0m', `${userId} entered tournament-service`);

        try {
            const response = await fetch(`${UM_SERVICE_URL}/get-user/${userId} `, {
                method: 'GET'
            })
            if (!response.ok) {
                const userdata = await response.json()
                console.log(userdata)
                throw new Error(`HTTP error! status: ${response.status}`);
              }
            const userdata = await response.json()
            console.log(userdata)

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
            reply.code(200).send({ 
                message: 'User saved successfully', 
                usersPos: result.lastInsertRowid 
            });
        }
        catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Failed to add new user to users table' });
        }
    }
}
