import moment, { type Moment } from 'moment'
import { z } from 'zod'

export type Post = {
    id: number
    title: string
    body: string
    url?: string
    postedDate: Date
}

export type EventDraft = {
    summary: string
    description: string
    location: string | null
    start: Date
    end: Date
    allDay: boolean
}

export const monthNames = [
    'januari',
    'februari',
    'mars',
    'april',
    'maj',
    'juni',
    'juli',
    'augusti',
    'september',
    'oktober',
    'november',
    'december',
]

export const weekdayNames = [
    'måndag',
    'tisdag',
    'onsdag',
    'torsdag',
    'fredag',
    'lördag',
    'söndag',
]

export function decodeHtml(value: string): string {
    return value
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&nbsp;/g, ' ')
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
}

export function stripHtml(value: string): string {
    return decodeHtml(value)
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<li>/gi, '\n• ')
        .replace(/<[^>.]+>/g, '')
        .replace(/\r/g, '')
        .replace(/\u00a0/g, ' ')
        .trim()
}

export function unmarkLink(link: string): string {
    if (link.startsWith('!')) {
        return ''
    }

    const match = link.match(/^\[(.*)]\((.*)\)$/)
    if (!match) {
        return link
    }

    const text = match[1].replace(/\/$/, '')
    const url = match[2].replace(/\/$/, '')

    if (text === url) {
        return url
    }

    return `${text} (${url})`
}

export function unmark(text: string): string {
    const linkPattern = /!?\[.*?\]\(.*?\)/g
    const links = [...text.matchAll(linkPattern)].toReversed()
    links.forEach(link => {
        const unmarkedLink = unmarkLink(link[0])
        const start = link.index
        const end = start + link[0].length
        text = text.substring(0, start) + unmarkedLink + text.substring(end)
    })

    const headingPattern = /^#+ \b(.+)$/gm
    const headings = [...text.matchAll(headingPattern)].toReversed()
    headings.forEach(heading => {
        const unmarkedHeading = '\n' + heading[1] + '\n'
        const start = heading.index
        const end = start + heading[0].length
        text = text.substring(0, start) + unmarkedHeading + text.substring(end)
    })

    return text
        .replace(/\*+/gm, '') // Stars
        .replace(/ *\\ *$/gm, '') // Backslashes
        .replace(/([ \t]+(?=\n)|(?<=\n)[ \t]+)/g, '') // Useless whitespace
        .replace(/\n{3,}/g, '\n\n') // Extra newlines
        .trim()
}

export async function fetchJson(url: string): Promise<unknown> {
    const response = await fetch(url, { next: { revalidate: 60 * 15 } })
    if (!response.ok) {
        return null
    }

    return await response.json()
}

export const postSchema = z.object({
    id: z.int(),
    titleSv: z.string(),
    contentSv: z.string(),
    createdAt: z.coerce.date(),
})

export async function getLatestPosts(count: number = 8): Promise<Post[]> {
    const data = await fetchJson(
        `https://chalmers.it/api/news?pageSize=${count}`
    )
    if (!data) {
        return []
    }
    const parsedData = z.array(postSchema).parse(data)

    return parsedData.map(post => ({
        id: post.id,
        title: post.titleSv,
        body: unmark(stripHtml(post.contentSv)),
        url: `https://chalmers.it/news/${post.id}`,
        postedDate: post.createdAt,
    }))
}

export function findLocation(body: string): string | null {
    const patterns: (RegExp | [RegExp, (location: string) => string])[] = [
        /^.{0,10}\b(?:vart?|plats|location)[ \t]*[-:?]?[ \t]*(.+)/im,
        [/\bstorhubben\b/i, () => 'Storhubben, Hubben 2.2'],
        [/\bctc\b/i, () => 'CTC, Hubben 2.2'],
        [/\bgrupprummet\b/i, () => 'Grupprummet, Hubben 2.2'],
        [/\b(?:utanför +)?hubben\b/i, s => s + ' 2.2'],
        /\bsandlådan\b/i,
        /\b(?:utanför +)?e[- ]?studion?\b/i,
        /\b(?:sb[- ]?)?multisal(?:en)?\b/i,
        /\bh[abc][1234]\b/i,
        /\bvasa[- ]?abcd\b/i,
    ]

    for (const p of patterns) {
        const [pattern, transform] = Array.isArray(p)
            ? p
            : [p, (s: string): string => s]
        const match = body.match(pattern)
        if (!match) {
            continue
        }

        if (match[1]) {
            return transform(match[1].trim())
        }

        return transform(match[0].trim())
    }

    return null
}

export function createEventDraft(post: Post): EventDraft | null {
    const summary = post.title.trim() || 'Untitled event'
    const body = post.body || 'No description provided.'
    const location = findLocation(body)
    const dateRange = extractDateRange(body, post.postedDate)
    if (dateRange === null) {
        return null
    }
    const { start, end, allDay } = dateRange

    return {
        summary,
        description: body,
        location,
        start,
        end,
        allDay,
    }
}

export function extractDateRange(
    body: string,
    now?: Date
): {
    start: Date
    end: Date
    allDay: boolean
} | null {
    const today = moment(now ?? new Date())
        .hour(0)
        .minute(0)
        .second(0)
        .millisecond(0)

    const primaryPatterns = [
        /\b(\d{1,2})\/(\d{1,2})\b/g,
        /\b(\d{4})-(\d{2})-(\d{2})\b/g,
        new RegExp(
            String.raw`\b(\d{1,2})(?::?[ea])?\s+(${monthNames.join('|')})\b`,
            'ig'
        ),
    ]
    const secondaryPatterns = [
        new RegExp(
            String.raw`\b(nästa|på|denna|nästnästa)?\s*(${weekdayNames.join('|')})(?:ar)?\b`,
            'ig'
        ),
    ]

    function updateDateWithMatch(
        date: Moment,
        match: RegExpMatchArray,
        patternIndex: number
    ): void {
        ;[
            (): void => {
                // Format: D/M
                date.date(Number(match[1]))
                date.month(Number(match[2]) - 1)
                if (date.month() < today.month()) {
                    date.add(1, 'year')
                }
            },
            (): void => {
                // Format: YYYY-MM-DD
                if (match[1]) {
                    date.year(Number(match[1]))
                }
                date.month(Number(match[2]))
                date.date(Number(match[3]))
            },
            (): void => {
                // Format: D MMMM
                date.date(Number(match[1]))
                date.month(monthNames.indexOf(match[2].toLowerCase()))
                if (date < today) {
                    date.add(1, 'year')
                }
            },
            (): void => {
                // Format: nästa|på|denna|nästnästa WW
                const weekday = weekdayNames.indexOf(match[2].toLowerCase()) + 1
                date.isoWeekday(weekday)

                const specifier = (
                    match[1] as string | undefined
                )?.toLowerCase()
                if (date < today) date.add(1, 'week')
                if (specifier === 'nästnästa') date.add(1, 'week')
            },
        ][patternIndex]()
    }

    function findAll(
        patterns: RegExp[],
        offset: number = 0
    ): [Moment, number][] {
        return patterns
            .flatMap((pattern, i): [Moment, number][] => {
                const matches = body.matchAll(pattern)
                return [...matches].map(match => {
                    const date = today.clone()
                    updateDateWithMatch(date, match, i + offset)
                    return [date, match.index]
                })
            })
            .toSorted((a, b) => a[1] - b[1])
    }

    let dates = findAll(primaryPatterns)
    if (dates.length === 0) {
        dates = findAll(secondaryPatterns, primaryPatterns.length)
    }

    const [start, _startIndex] = dates[0] ?? today.clone()

    const timePattern = /\b(?:(?:kl|klockan)\s*)?(\d{1,2})[:.](\d{2})\b/i
    const startTimeMatch = body.match(timePattern)
    let end = start.clone().add(1, 'hour')
    if (startTimeMatch) {
        start.hour(Number(startTimeMatch[1]))
        start.minute(Number(startTimeMatch[2]))

        end = start.clone().add(1, 'hour')
        const endTimeMatch = body
            .substring((startTimeMatch.index ?? 0) + startTimeMatch[0].length)
            .match(timePattern)
        if (endTimeMatch) {
            end.hour(Number(endTimeMatch[1]))
            end.minute(Number(endTimeMatch[2]))
        }
    }

    return {
        start: start.toDate(),
        end: end.toDate(),
        allDay: startTimeMatch === null,
    }
}

export function createGoogleCalendarUrl(event: EventDraft): string {
    const start = formatCalendarDate(event.start)
    const end = formatCalendarDate(event.end)
    const url = new URL('https://calendar.google.com/calendar/render')

    url.searchParams.set('action', 'TEMPLATE')
    url.searchParams.set('text', event.summary)
    url.searchParams.set('details', event.description)
    if (event.location) {
        url.searchParams.set('location', event.location)
    }
    url.searchParams.set('dates', `${start}/${end}`)

    return url.toString()
}

export function formatCalendarDate(date: Date): string {
    return date
        .toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d{3}Z$/, 'Z')
}
