import db from '../src/db/connection.js'

function seedUsers () {
  // Clear existing users
  db.prepare('DELETE FROM users').run()

  // Insert test users
  const stmt = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)')
  const users = [
    { username: 'user1', email: 'user1@example.com', password: 'password123' },
    { username: 'user2', email: 'user2@example.com', password: 'password123' },
    { username: 'user3', email: 'user3@example.com', password: 'password123' },
    { username: 'user4', email: 'user4@example.com', password: 'password123' }
  ]

  users.forEach(user => {
    stmt.run(user.username, user.email, user.password)
  })

  console.log('Users seeded successfully')
}

seedUsers()
