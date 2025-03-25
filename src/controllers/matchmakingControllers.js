export async function verifyUser (userId) {
  try {
    const response = await fetch('http://localhost:3002/matchmaking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
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
