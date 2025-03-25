import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dataDir = path.join(__dirname, '../../data')
const dbPath = path.join(__dirname, '../../data/matchmaking.sqlite')

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, {
    recursive: true
  })
}

// Creating connection
const db = new Database(dbPath, {
  verbose: console.log
})

export default db
