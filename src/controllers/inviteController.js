const UM_SERVICE_URL = 'http://localhost:3002';

export const inviteController = {

    async sendInvite (request, reply) {
        const { tournamentId } = request.params
        console.log('\x1b[1m\x1b[42m\x1b[30m%s\x1b[0m', `Sending invite for tournament: ${tournamentId}`);

        try {
            const response = await fetch(`${UM_SERVICE_URL}/invite-friend`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ tournamentId }) //change to tournamentId in um service
            })
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            reply.code(200).send({ 
                message: 'User invited successfully', 
                usersPos: result.lastInsertRowid 
            });
        }
        catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Failed to invite user' });
        }
    }
}
