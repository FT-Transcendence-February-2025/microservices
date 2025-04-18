import config from '../config/config.js'

export async function verifyUser (userId) {
  try {
    const response = await fetch(`${config.endpoints.user}/get-user/${userId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    const data = await response.json()
    return { status: response.status, ...data }
  } catch (error) {
    console.error('Error verifying user:', error)
    return { error: 'User verification failed' }
  }
}

export const matchmakingController = {
  async postMatchMaking (request, reply) {
    const { userId } = request.body
    const verification = await verifyUser(userId)

    if (verification.error || verification.status !== 200) {
      return reply.status(verification.status || 500).send({
        error: verification.error || 'User not found or error verifying user'
      })
    }

    return reply.code(200).send({
      success: 'User verified',
      displayName: verification.displayName
    })
  }
}
