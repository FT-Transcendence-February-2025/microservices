import WebSocket from 'ws'

const token = '$2a$12$po5KeyhOn71ZhIzzAIWkouAslkUTWqJBINGEAcIJcaF7f8MdHJTPS'
const ws = new WebSocket('ws://localhost:3001/ws')

ws.on('open', () => {
  console.log('Connected to WebSocker server')

  // Send joinQueue message
  ws.send(
    JSON.stringify({
      type: 'joinQueue',
      userId: 7,
      token
    })
  )
})

ws.on('message', (data) => {
  const message = JSON.parse(data)
  console.log('Received:', message)

  if (message.type === 'queueJoined') {
    console.log('Successfully joined queue!')
    ws.close()
  }
})

ws.on('error', console.error)
