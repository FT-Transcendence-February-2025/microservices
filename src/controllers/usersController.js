export const usersController = {
    
    async initUsersTable (request, reply) {
        console.log(`Users table init...`);
        const { tournamentId } = request.params
        const { userId } = request.body

        try {
            const response = await fetch(`path/to/um?userId=${userId}&tournamentId=${tournamentId}`)
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
                userdata.user_id,
                userdata.display_name,
                userdata.avatar
            );
            console.log(`User inserted in Position: ${result.lastInsertRowid}`);

            reply.code(201).send({ message: 'User data saved successfully', usersPos: result.lastInsertRowid });
        }
        catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Failed to fetch user data from user management service' });
        }
    }
}