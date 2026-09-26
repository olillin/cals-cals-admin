import { it, expect } from 'vitest'

import { unmark } from '@/lib/scraper'

it('unmarks a single link', () => {
    const body = '[my link](https://example.com/path)'
    const result = unmark(body)
    expect(result).toBe('my link (https://example.com/path)')
})

it('simplifies a URL which links to itself', () => {
    const body = '[https://example.com/path](https://example.com/path)'
    const result = unmark(body)
    expect(result).toBe('https://example.com/path')
})

it('removes image links', () => {
    const body = '![image](https://example.com/path)'
    const result = unmark(body)
    expect(result).toBe('')
})

it('unmarks multiple links', () => {
    const body =
        'Welcome to the event\n\n[Here](https://example.com) is the first link and [over there](https://foo.org/path)!'
    const result = unmark(body)
    expect(result).toBe(
        'Welcome to the event\n\nHere (https://example.com) is the first link and over there (https://foo.org/path)!'
    )
})

it('does not remove raw URLs', () => {
    const body = 'Welcome to the event: https://example.com'
    const result = unmark(body)
    expect(result).toBe('Welcome to the event: https://example.com')
})

it('replaces headings', () => {
    const body = '## Welcome to the event'
    const result = unmark(body)
    expect(result).toBe('Welcome to the event')
})

it('inserts empty row before headings', () => {
    const body = 'Text\n## Welcome to the event'
    const result = unmark(body)
    expect(result).toBe('Text\n\nWelcome to the event')
})

it('inserts empty row after headings', () => {
    const body = '## Welcome to the event\nOther text'
    const result = unmark(body)
    expect(result).toBe('Welcome to the event\n\nOther text')
})

it('removes formatting backslashes', () => {
    const body = 'Hello\\\nworld'
    const result = unmark(body)
    expect(result).toBe('Hello\nworld')
})

it('removes extra whitespace around newlines', () => {
    const body = 'Hello    \n   \n\t  world'
    const result = unmark(body)
    expect(result).toBe('Hello\n\nworld')
})

it('removes extra newlines', () => {
    const body = 'Hello\n  \n\t\n\n  \nworld'
    const result = unmark(body)
    expect(result).toBe('Hello\n\nworld')
})

it('trims ends', () => {
    const body = '  \n  \t Hello world \n    \t    '
    const result = unmark(body)
    expect(result).toBe('Hello world')
})

it('removes stars', () => {
    const body = '**hello** *world*'
    const result = unmark(body)
    expect(result).toBe('hello world')
})
