import {userService} from '../db/userService.js'
import { tournamentService } from '../db/tournamentService.js';

export const joinController = {

    async joinTournament (request, reply) {
        const { tournamentId } = request.params
        const { userId } = request.body
        console.log('\x1b[1m\x1b[42m\x1b[30m%s\x1b[0m', `${userId} entered tournament-service`);

        const addUser = await userService.addUser(userId)
        const registerPlayer = tournamentService.registerPlayer(tournamentId, userId)
        if (!addUser.success) {
            return reply.code(400).send({
                statusCode: addUser.statusCode,
                error: 'Bad Request',
                details: addUser.message
            })
        }
        if (!registerPlayer.success) {
            return reply.code(400).send({
                statusCode: 400,
                error: 'Bad Request',
                details: registerPlayer.message
            })
        }
        return reply.code(200).send({ 
            message: addUser.message,
            usersPos: addUser.usersPos,
            message: registerPlayer.message
        });
    }
}