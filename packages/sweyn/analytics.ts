import fs from 'node:fs/promises'
import path from 'node:path'
import type { IncomingMessage } from 'node:http'
import createDatabase from './db.ts'
import { registerRoute } from './routes.ts'
import { renderVariables } from './renderer.ts'
import { authenticate } from './utils.ts'
import type { DatabaseSync } from 'node:sqlite'

type DBRecord = {
  created_at: string
  ip: string
  referer: string
}

type AnalyticsConfig = {
  root?: string
  admin?: {
    login?: string
    password?: string
  }
}

export function createAnalytics(config: AnalyticsConfig) {
  const { db, createTable } = createDatabase('analytics.db')

  createTable('visitor', {
    ip: 'string',
    referer: 'string',
  })

  // generateFakeVisitors(db, 10000)

  registerRoute({
    route: '/analytics',
    handler: async (req, res) => {
      authenticate(req, res, {
        username: config.admin?.login || '',
        password: config.admin?.password || '',
      })

      const fileContent = await fs.readFile(
        path.join(config.root || '', 'analytics.html')
      )

      const pretty = getData(db, { days: 365, resolution: '1 day' })

      const maxValue = Math.max(...pretty.map(v => v[1] || 0))

      const html = pretty.reduce((acc, cur, i, arr) => {
        if (!cur[1]) return acc

        const li = `
        <tr>
          <th>${cur[0]}</th>
          <td style="--size: ${cur[1] / maxValue}">
            <span class="data">${cur[1]}</span>
          </td>    
        </tr>`

        return acc + li
      }, '')

      const total_count = pretty.reduce((acc, cur) => (acc += cur.length), 0)

      return renderVariables(fileContent.toString(), {
        data: html,
        total_count,
      })
    },
  })

  function recordVisitor(req: IncomingMessage) {
    const { userAgent, remoteIp } = visitorFromRequest(req)

    const { pathname } = new URL(req.url || '', 'https://foobar.com')

    if (pathname === '/analytics') return
    if (isBot(userAgent)) return
    if (!remoteIp || isRegistered(db, remoteIp)) return

    const referer = req.headers.referrer || req.headers.referer
    const refererStr = Array.isArray(referer) ? referer[0] : referer

    if (typeof remoteIp === 'string' && refererStr) {
      db.prepare('INSERT INTO visitor (ip, referer) VALUES (?, ?)').run(
        remoteIp,
        refererStr
      )
    }
  }

  return {
    recordVisitor,
  }
}

function getData(db: DatabaseSync, { days = 31, resolution = '1 hour' }) {
  let query = ''

  switch (days) {
    case 1: {
      query = `SELECT * FROM visitor WHERE created_at BETWEEN datetime('now', '-1 day') AND datetime('now')`
      break
    }
    case 7: {
      query = `SELECT * FROM visitor WHERE created_at BETWEEN datetime('now', '-1 week') AND datetime('now')`
      break
    }
    case 31: {
      query = `SELECT * FROM visitor WHERE created_at BETWEEN datetime('now', '-1 month') AND datetime('now')`
      break
    }
    case 365: {
      query = `SELECT * FROM visitor WHERE created_at BETWEEN datetime('now', '-1 year') AND datetime('now')`
      break
    }
  }

  const data = db.prepare(query).all() as DBRecord[]

  const resolutions: Record<string, number> = {
    '1 second': 1000,
    '1 minute': 1000 * 60,
    '1 hour': 1000 * 60 * 60,
    '1 day': 1000 * 60 * 60 * 24,
    '1 week': 1000 * 60 * 60 * 24 * 7,
    '1 month': 1000 * 60 * 60 * 24 * 7 * 31,
    '1 year': 1000 * 60 * 60 * 24 * 7 * 365,
  }

  const res = resolutions[resolution]

  const grouped = Object.groupBy(
    data,
    ({ created_at }: DBRecord) =>
      Math.floor(new Date(created_at).getTime() / res) * res
  )

  const sorted = Object.entries(grouped).toSorted((a, b) => {
    return a[0] < b[0] ? -1 : 1
  })

  const pretty = sorted.map(([key, value]): [string, number | undefined] => {
    const date = new Date(parseInt(key))

    const showTime = ['1 second', '1 minute', '1 hour'].includes(resolution)

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      ...(showTime
        ? { hour: 'numeric', minute: 'numeric', second: 'numeric' }
        : {}),
    }

    const formatter = new Intl.DateTimeFormat('da-DK', options)
    const formattedDate = formatter.format(date)

    return [formattedDate, value?.length]
  })

  return pretty
}

function isRegistered(db: DatabaseSync, ip: string) {
  return db
    .prepare(
      `SELECT ip, created_at FROM visitor WHERE ip = ? AND created_at >= datetime('now', '-1 hour')`
    )
    .get(ip)
}

function visitorFromRequest(req: IncomingMessage) {
  const userAgent = req.headers['user-agent']
  const remoteIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress

  return {
    userAgent,
    remoteIp: Array.isArray(remoteIp) ? remoteIp[0] : remoteIp,
  }
}

function isBot(userAgent: string = '') {
  return /(bot|check|cloud|crawler|download|monitor|preview|scan|spider|google|qwantify|yahoo|HeadlessChrome)/i.test(
    userAgent
  )
}

export function generateFakeVisitors(db: DatabaseSync, count: number) {
  db.exec(`CREATE TABLE IF NOT EXISTS visitor (
    id 'integer primary key autoincrement',
    created_at 'date',
    ip 'string',
    referer 'string'
  );`)

  const zero255 = () => Math.floor(Math.random() * 255)
  const randomIP = () => `${zero255()}.${zero255()}.${zero255()}.${zero255()}`

  for (let i = 0; i < count; i++) {
    db.prepare(
      "INSERT INTO visitor (created_at, ip) VALUES (datetime('now', '-' || (abs(random()) % (365 * 24 * 60 * 60 * 3)) || ' seconds'), ?)"
    ).run(randomIP())
  }
}
