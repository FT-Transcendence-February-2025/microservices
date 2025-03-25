export const matchmakingController = {
  async postMatchMaking (request, reply) {
    try {
      const { userId } = request.body
      const response = await fetch('http://user-management:3002/matchmaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      const data = await response.json()
      return reply.code(response.status).send(data)
    } catch (error) {
      console.error('Error forwarding request:', error)
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error'
      })
    }
  }
}
