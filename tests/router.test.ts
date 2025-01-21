import { describe, expect, it } from 'vitest'
import { registerRoute, getMatchingRoute } from 'sweyn/routes'

/**
 * prepare
 */
const mocks = ['/first', '/first/second', '/[slug]', '/[slug]/page']

mocks.forEach(mock => registerRoute({ route: mock, handler: () => {} }))

/**
 * test
 */
describe('Routes should return the correct route', () => {
  it('Should find exact route', async () => {
    const { route } = getMatchingRoute('/first')

    expect(route).toBe('/first')
  })

  it('Should find fuzzy route', async () => {
    const { route } = getMatchingRoute('/something')

    expect(route).toBe('/[slug]')
  })

  it('Should find deep route', async () => {
    const { route } = getMatchingRoute('/first/second')

    expect(route).toBe('/first/second')
  })

  it('Should favour more accurate route', async () => {
    const { route } = getMatchingRoute('/[something]/page')

    expect(route).toBe('/[slug]/page')
  })

  it('Should work for nonexisting routes', async () => {
    const { route } = getMatchingRoute('/this/page/does/not/exist')

    expect(route).toBe(null)
  })
})
