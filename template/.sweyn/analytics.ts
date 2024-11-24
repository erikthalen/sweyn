import fs from 'fs/promises'
import type { IncomingMessage } from 'http'
import createDatabase from './db.ts'
import { registerRoute } from './routes.ts'
import { renderVariables } from './renderer.ts'
import path from 'path'
import { authenticate } from './utils.ts'
import { config } from './index.ts'
import { withHMR } from './hmr.ts'

const { db, createTable } = createDatabase('analytics.sqlite')

createTable('visitor', {
  ip: 'number',
  referer: 'string',
})

function getData({ timeframe = '1 month', resolution = '1 day' }) {
  let query = ''

  switch (timeframe) {
    case '1 day': {
      query = `SELECT * FROM visitor WHERE created_at BETWEEN datetime('now', '-1 day') AND datetime('now')`
      break
    }
    case '1 week': {
      query = `SELECT * FROM visitor WHERE created_at BETWEEN datetime('now', '-1 week') AND datetime('now')`
      break
    }
    case '1 month': {
      query = `SELECT * FROM visitor WHERE created_at BETWEEN datetime('now', '-1 month') AND datetime('now')`
      break
    }
    case '1 year': {
      query = `SELECT * FROM visitor WHERE created_at BETWEEN datetime('now', '-1 year') AND datetime('now')`
      break
    }
  }

  const data = db.prepare(query).all()

  const resolutions = {
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
    ({ created_at }) => Math.floor(new Date(created_at).getTime() / res) * res
  )

  const sorted = Object.entries(grouped).toSorted((a, b) => {
    return a[0] < b[0] ? -1 : 1
  })

  const pretty = sorted.map(([key, value]): [string, number] => {
    const date = new Date(parseInt(key))

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    }

    const formatter = new Intl.DateTimeFormat('da-DK', options)
    const formattedDate = formatter.format(date)

    return [formattedDate, value.length]
  })

  return pretty
}

registerRoute({
  route: '/analytics',
  handler: async (req, res, { query }) => {
    authenticate(req, res, {
      username: config.admin.login,
      password: config.admin.password,
    })

    const fileContent = await fs.readFile(
      path.join(config.root, 'analytics.html')
    )

    const pretty = getData({ timeframe: '1 year', resolution: '1 day' })

    const maxValue = Math.max(...pretty.map(v => v[1]))

    const html = pretty.reduce((acc, cur, i, arr) => {
      const li = `
      <tr>
        <th>${cur[0]}</th>
        <td style="--size: ${cur[1] / maxValue}">
          <span class="data">${cur[1]}</span>
        </td>    
      </tr>`

      return acc + li
    }, '')

    return withHMR(
      renderVariables(fileContent.toString(), {
        // data: JSON.stringify(pretty, null, 2),
        data: html,
      }),
      { fromString: true }
    )
  },
})

function isBot(userAgent) {
  return /(bot|check|cloud|crawler|download|monitor|preview|scan|spider|google|qwantify|yahoo|HeadlessChrome)/i.test(
    userAgent
  )
}

function visitorFromRequest(req: IncomingMessage) {
  const userAgent = req.headers['user-agent']
  const remoteIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress

  return { userAgent, remoteIp }
}

function register(ip, referer) {
  db.prepare('INSERT INTO visitor (ip, referer) VALUES (?, ?)').run(ip, referer)
}

function isRegistered(ip) {
  return db
    .prepare(
      `SELECT ip, created_at FROM visitor WHERE ip = ? AND created_at >= datetime('now', '-1 hour')`
    )
    .get(ip)
}

export default function (req: IncomingMessage) {
  const { userAgent, remoteIp } = visitorFromRequest(req)

  const { pathname } = new URL('https://foobar.com' + req.url)

  if (pathname === '/analytics') return
  if (isBot(userAgent)) return
  if (isRegistered(remoteIp)) return

  const referer = req.headers.referrer || req.headers.referer

  register(remoteIp, referer)
}

function generateFakeVisitors(count) {
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

// generateFakeVisitors(10_000)
