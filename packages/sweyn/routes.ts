import type { Route, RouteHandler } from './types.ts'

export const routes = new Map()

// api
export function registerRoute({ method = 'GET', route, handler }: Route) {
  const registeredMethod = routes.get(method.toUpperCase())

  if (!registeredMethod) {
    routes.set(method.toUpperCase(), new Map())
  }

  routes.get(method.toUpperCase())?.set(route, handler)
}

export function isWildcard(str: string): boolean {
  return str.charAt(0) === '['
}

export function withoutWildcards(str: string): string {
  if (!isWildcard(str)) return str
  return str.replace('[', '').replace(']', '')
}

function getRouteHandler(method, route) {
  return routes.get(method)?.get(route)
}

// helpers
function sameDepth(arr1: any[], arr2: any[]): boolean {
  return arr1.length === arr2.length
}

export function asParts(str: string): string[] {
  if (typeof str !== 'string') return str
  return str.substring(1).split('/')
}

function fuzzyFind(routes, url: string): string[] {
  const urlParts = asParts(url)

  let matches: string[] = []

  routes.keys().forEach(route => {
    const routeParts = asParts(route)

    if (!sameDepth(routeParts, urlParts)) return
    if (!routeParts.find(isWildcard)) return

    if (
      urlParts.every(
        (part, idx) => part === routeParts[idx] || isWildcard(routeParts[idx])
      )
    ) {
      matches.push(route)
    }
  })

  return matches
}

function rateMatches(matches: string[], url: string): string[] {
  return [...matches]?.sort((a, b) => {
    return getRating(a, url) < getRating(b, url) ? 1 : -1
  })
}

function getRating(haystack: string, needle: string): number {
  const needles = [...asParts(needle)].reverse()
  const haystacks = [...asParts(haystack)].reverse()

  return haystacks.reduce((acc: number, part: string, idx: number) => {
    if (part === needles[idx]) acc += 2 ** idx

    return acc
  }, 0)
}

export const getMatchingRoute = (
  url: string,
  method = 'GET'
): { route: string | null; handler: RouteHandler | null } => {
  const empty = { route: null, handler: null }

  try {
    const routesOfMethod = routes.get(method)

    if (!routesOfMethod) return empty

    const result = routesOfMethod.get(url)

    if (result) return { route: url, handler: result }

    const matches = fuzzyFind(routesOfMethod, url)
    const bestMatch = rateMatches(matches, url)?.at(0)

    if (!bestMatch) return empty

    return { route: bestMatch, handler: getRouteHandler(method, bestMatch) }
  } catch (error) {
    console.log(error)
    throw { status: 404, message: 'No route found' + error }
  }
}

export function clearRoutes () {
  routes.clear()
}