export const inviteController = {

    async sendInvite (request, reply) {
        console.log(`Sending invite for tournament: ${request.params}`);
        const { tournamentId } = request.params
        const { userId } = request.body
        //pass status if accepted or declined
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
            console.log(`Invited user inserted in Position: ${result.lastInsertRowid}`);

            const register = tournamentService.registerPlayer(tournamentId, result.user_id)
            if (!register.success) {
                return reply.code(400).send({
                    statusCode: 400,
                    error: register.error,
                    details: register.message
                })
            }

            reply.code(201).send({ message: 'User invited successfully', usersPos: result.lastInsertRowid });
        }
        catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Failed to invite user' });
        }
    }
}
