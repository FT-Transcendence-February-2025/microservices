import {userService} from '../db/userService.js'
import config from '../config/config.js'
const UM_SERVICE_URL = config.endpoints.user;

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
    async checkFriendsList(request, reply) {
        const { userId } = request.body
        console.log(`Checking Friendslist for active Tournament`);
        const response = await fetch(`${UM_SERVICE_URL}/get-user-friend-list/${userId }`, {
            method: 'GET'
        })
        if (!response.ok) {
            const userdata = await response.json()
            console.log(userdata)
            const error = new Error(`User not found`);
            error.statusCode = response.status;
            throw error;
        }
        /*
        go through friends - compare to createt_by in tm table - if found display tm and join request gets send to created_by
        */
    }
}
