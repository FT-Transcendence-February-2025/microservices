import {userService} from '../db/userService.js'

export const usersController = {

    async addUser (request, reply) {
        const { userId } = request.body
        console.log('\x1b[1m\x1b[42m\x1b[30m%s\x1b[0m', `${userId} entered tournament-service`);

        const result = await userService.addUser(userId)
        if (!result.success) {
            return reply.code(400).send({
                statusCode: result.statusCode,
                error: 'Bad Request',
                details: result.message
            })
        }
        return reply.code(200).send({ 
            message: result.message,
            usersPos: result.usersPos
        });
        
    },
    
}
