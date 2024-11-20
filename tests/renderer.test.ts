import { describe, expect, it } from 'vitest'
import { renderFileString } from 'sweyn/renderer'

describe('Renderer should work', () => {
  it('should render a file', async () => {
    expect(await renderFileString('<p>Hej</p>')).toBe('<p>Hej</p>')
  })
})
