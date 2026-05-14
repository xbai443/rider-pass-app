import { Router, Request, Response } from 'express'
import { v4 as uuid } from 'uuid'
import db from '../db'

const router = Router()

router.post('/login', (req: Request, res: Response) => {
  const { nickname } = req.body

  if (!nickname || typeof nickname !== 'string' || !nickname.trim()) {
    return res.status(400).json({ error: '昵称不能为空' })
  }

  const trimmed = nickname.trim().slice(0, 20)

  let user = db.prepare('SELECT * FROM users WHERE nickname = ?').get(trimmed) as Row | undefined

  if (!user) {
    const id = uuid()
    const now = Date.now()
    db.prepare('INSERT INTO users (id, nickname, created_at) VALUES (?, ?, ?)').run(id, trimmed, now)
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as Row
  }

  res.json({
    id: user.id,
    nickname: user.nickname,
    createdAt: user.created_at,
  })
})

router.get('/:id/profile', (req: Request, res: Response) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id) as Row | undefined
  if (!user) return res.status(404).json({ error: '用户不存在' })

  const contributionCount = db.prepare('SELECT COUNT(*) as count FROM entries WHERE contributor_id = ?').get(user.id) as { count: number }

  res.json({
    id: user.id,
    nickname: user.nickname,
    contributionCount: contributionCount.count,
    createdAt: user.created_at,
  })
})

router.get('/rankings', (_req: Request, res: Response) => {
  const rows = db.prepare(`
    SELECT u.id, u.nickname, COUNT(e.id) as contribution_count
    FROM users u
    LEFT JOIN entries e ON e.contributor_id = u.id
    GROUP BY u.id
    ORDER BY contribution_count DESC, u.created_at ASC
    LIMIT 50
  `).all() as { id: string; nickname: string; contribution_count: number }[]

  res.json(rows.map(r => ({
    id: r.id,
    nickname: r.nickname,
    contributionCount: r.contribution_count,
  })))
})

interface Row {
  id: string
  nickname: string
  created_at: number
}

export default router