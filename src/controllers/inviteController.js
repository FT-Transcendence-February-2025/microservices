import config from '../config/config.js';

import db from '../db/database.js'

export const inviteController = {

    async sendInvite (request, reply) {
        const { tournamentId } = request.params
        const { userId } = request.body
        const { userIds } = request.body
        console.log('\x1b[1m\x1b[42m\x1b[30m%s\x1b[0m', `Sending invite for tournament: ${tournamentId}`);

        try {
            const tournament = db.prepare('SELECT name FROM tournaments WHERE id = ?').get(tournamentId);

            if (!tournament) {
                return reply.code(404).send({
                    statusCode: 404,
                    error: 'Tournament not found',
                    message: `No tournament found with ID ${tournamentId}`
                });
            }

            const tournamentName = tournament.name;
            const ids = userIds
            console.log('\x1b[1m\x1b[42m\x1b[30m%s\x1b[0m', `Sending invite for tournament: ${tournamentName}`);

            const response = await fetch(`${config.endpoints.user}/invite-tournament`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ tournamentId, tournamentName, ids, userId })
            })
            if (!response.ok) {
                const userdata = await response.json()
                console.log(userdata)
                const error = new Error(`Failed to fetch data`);
                error.statusCode = response.status;
                throw error;
            }
            reply.code(200).send({ 
                statusCode: 200,
                message: `Users: ${userIds} invited successfully to tournament: ${tournamentName}`
            });
        }
        catch (error) {
            request.log.error(error);
            reply.code(500).send({ 
                error: 'Failed to invite user',
                message: error.message,
                statusCode: error.statusCode || 500
            });
        }
    }
}
