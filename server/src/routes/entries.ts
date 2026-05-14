import { Router, Request, Response } from 'express'
import { v4 as uuid } from 'uuid'
import db from '../db'

const router = Router()

router.get('/', (req: Request, res: Response) => {
  const { query, attitude, city, sort } = req.query

  let sql = `
    SELECT e.*, u.nickname as contributor_nickname
    FROM entries e
    LEFT JOIN users u ON e.contributor_id = u.id
    WHERE 1=1
  `
  const params: unknown[] = []

  if (query && typeof query === 'string' && query.trim()) {
    sql += ' AND e.name LIKE ?'
    params.push(`%${query.trim()}%`)
  }

  if (attitude && typeof attitude === 'string') {
    const val = parseInt(attitude, 10)
    if (val >= 0 && val <= 3) {
      sql += ' AND e.guard_attitude = ?'
      params.push(val)
    }
  }

  if (city && typeof city === 'string' && city.trim()) {
    sql += ' AND e.address LIKE ?'
    params.push(`%${city.trim()}%`)
  }

  if (sort === 'useful') {
    sql += ' ORDER BY (e.up_votes - e.down_votes) DESC, e.created_at DESC'
  } else {
    sql += ' ORDER BY e.created_at DESC'
  }

  const rows = db.prepare(sql).all(...params)
  const entries = rows.map(mapRow)
  res.json(entries)
})

router.get('/:id', (req: Request, res: Response) => {
  const row = db.prepare(`
    SELECT e.*, u.nickname as contributor_nickname
    FROM entries e
    LEFT JOIN users u ON e.contributor_id = u.id
    WHERE e.id = ?
  `).get(req.params.id) as Row | undefined
  if (!row) return res.status(404).json({ error: '条目不存在' })
  res.json(mapRow(row))
})

router.post('/', (req: Request, res: Response) => {
  const { name, address, lat, lng, entrance, guardAttitude, elevatorAccess, tips, contributorId } = req.body

  if (!name || !address || lat == null || lng == null) {
    return res.status(400).json({ error: '名称、地址、坐标不能为空' })
  }

  const id = uuid().slice(0, 8)
  const now = Date.now()

  db.prepare(`
    INSERT INTO entries (id, name, address, lat, lng, entrance, guard_attitude, elevator_access, tips, contributor_id, created_at, up_votes, down_votes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)
  `).run(id, name, address, lat, lng, entrance || '', guardAttitude ?? 1, elevatorAccess ? 1 : 0, tips || '', contributorId || null, now)

  const row = db.prepare(`
    SELECT e.*, u.nickname as contributor_nickname
    FROM entries e
    LEFT JOIN users u ON e.contributor_id = u.id
    WHERE e.id = ?
  `).get(id) as Row
  res.status(201).json(mapRow(row))
})

router.post('/:id/vote', (req: Request, res: Response) => {
  const { userId, direction } = req.body
  const entryId = req.params.id

  if (!userId) return res.status(400).json({ error: '需要用户ID' })
  if (direction !== 1 && direction !== -1) return res.status(400).json({ error: 'direction 必须是 1 或 -1' })

  const entry = db.prepare('SELECT * FROM entries WHERE id = ?').get(entryId)
  if (!entry) return res.status(404).json({ error: '条目不存在' })

  const existing = db.prepare('SELECT * FROM votes WHERE user_id = ? AND entry_id = ?').get(userId, entryId) as Row | undefined
  if (existing) return res.status(409).json({ error: '已经投过票了' })

  db.prepare('INSERT INTO votes (user_id, entry_id, direction) VALUES (?, ?, ?)').run(userId, entryId, direction)

  if (direction === 1) {
    db.prepare('UPDATE entries SET up_votes = up_votes + 1 WHERE id = ?').run(entryId)
  } else {
    db.prepare('UPDATE entries SET down_votes = down_votes + 1 WHERE id = ?').run(entryId)
  }

  const row = db.prepare(`
    SELECT e.*, u.nickname as contributor_nickname
    FROM entries e
    LEFT JOIN users u ON e.contributor_id = u.id
    WHERE e.id = ?
  `).get(entryId) as Row
  res.json(mapRow(row))
})

router.delete('/all', (_req: Request, res: Response) => {
  db.prepare('DELETE FROM votes').run()
  db.prepare('DELETE FROM entries').run()
  res.json({ success: true, message: '已清除所有条目' })
})

router.delete('/:id', (req: Request, res: Response) => {
  const { userId } = req.body
  const entryId = req.params.id

  const entry = db.prepare('SELECT * FROM entries WHERE id = ?').get(entryId) as Row | undefined
  if (!entry) return res.status(404).json({ error: '条目不存在' })

  if (userId && entry.contributor_id && entry.contributor_id !== userId) {
    return res.status(403).json({ error: '只能删除自己的条目' })
  }

  db.prepare('DELETE FROM entries WHERE id = ?').run(entryId)
  res.json({ success: true })
})

interface Row {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  entrance: string
  guard_attitude: number
  elevator_access: number
  tips: string
  contributor_id: string | null
  contributor_nickname: string | null
  created_at: number
  up_votes: number
  down_votes: number
}

function mapRow(row: Row) {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    entrance: row.entrance,
    guardAttitude: row.guard_attitude,
    elevatorAccess: row.elevator_access === 1,
    tips: row.tips,
    contributor: row.contributor_nickname || '匿名骑手',
    createdAt: row.created_at,
    votes: { up: row.up_votes, down: row.down_votes },
  }
}

export default router