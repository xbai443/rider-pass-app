import express from 'express'
import cors from 'cors'
import { v4 as uuid } from 'uuid'
import db from './db'
import entriesRouter from './routes/entries'
import usersRouter from './routes/users'
import seeds from './seeds'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() })
})

app.use('/api/entries', entriesRouter)
app.use('/api/users', usersRouter)

app.post('/api/seed', (_req, res) => {
  const existingCount = (db.prepare('SELECT COUNT(*) as count FROM entries').get() as { count: number }).count
  if (existingCount > 0) {
    return res.status(409).json({ error: '数据库中已有数据，跳过种子导入', existingCount })
  }

  const systemUserId = uuid()
  const now = Date.now()
  db.prepare('INSERT OR IGNORE INTO users (id, nickname, created_at) VALUES (?, ?, ?)').run(systemUserId, '系统预置', now)

  const insert = db.prepare(`
    INSERT INTO entries (id, name, address, lat, lng, entrance, guard_attitude, elevator_access, tips, contributor_id, created_at, up_votes, down_votes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const insertMany = db.transaction(() => {
    let count = 0
    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i]
      const id = `seed-${String(i + 1).padStart(3, '0')}`
      const createdAt = now - (seeds.length - i) * 60000
      insert.run(id, s.name, s.address, s.lat, s.lng, s.entrance, s.guardAttitude, s.elevatorAccess ? 1 : 0, s.tips, systemUserId, createdAt, s.upVotes, s.downVotes)
      count++
    }
    return count
  })

  const count = insertMany()
  res.json({ success: true, imported: count })
})

app.listen(PORT, () => {
  console.log(`🚀 骑手通行证服务已启动: http://localhost:${PORT}`)
  console.log(`📋 API 端点: http://localhost:${PORT}/api`)
  console.log(`🌱 导入种子数据: POST http://localhost:${PORT}/api/seed`)
})