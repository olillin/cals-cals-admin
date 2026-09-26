import { it, expect } from 'vitest'

import { stripHtml } from '@/lib/scraper'

it('does not remove URLs', () => {
    const body = 'Welcome to the event: <https://example.com>'
    const result = stripHtml(body)
    expect(result).toBe('Welcome to the event: <https://example.com>')
})
