export type Post = {
    id: number
    title: string
    body: string
    url?: string
}

export type EventDraft = {
    summary: string
    description: string
    location: string
    start: Date
    end: Date
    allDay: boolean
}

const monthNames = [
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

const weekdayNames = [
    'måndag',
    'tisdag',
    'onsdag',
    'torsdag',
    'fredag',
    'lördag',
    'söndag',
]

function decodeHtml(value: string): string {
    return value
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&nbsp;/g, ' ')
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
}

function stripHtml(value: string): string {
    return decodeHtml(value)
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<li>/gi, '\n• ')
        .replace(/<[^>]+>/g, '')
        .replace(/\r/g, '')
        .replace(/\u00a0/g, ' ')
        .trim()
}

function unmarkLink(link: string): string {
    if (link.startsWith('!')) {
        return ''
    }

    const textMatch = link.match(/(?<=^\[).*?(?=\]\()/)
    const urlMatch = link.match(/(?<=\]\().*?(?=\)$)/)
    if (textMatch === null || urlMatch === null) {
        return link
    }

    const text = textMatch[0].replace(/\/$/, '')
    const url = textMatch[0].replace(/\/$/, '')

    if (text === url) {
        return url
    }

    return `${text} (${url})`
}

function unmark(text: string): string {
    const linkPattern = /!?\[.*?\]\(.*?\)/g
    const links = [...text.matchAll(linkPattern)].reverse()
    links.forEach(link => {
        const unmarkedLink = unmarkLink(link[0])
        const start = link.index
        const end = link[0].length
        text = text.substring(0, start) + unmarkedLink + text.substring(end)
    })

    return text.replace(/ *\\ *$/gm, '').trim()
}

async function fetchJson<T>(url: string): Promise<T | null> {
    const response = await fetch(url, { next: { revalidate: 60 * 15 } })
    if (!response.ok) {
        return null
    }

    return (await response.json()) as T
}

export async function getLatestPosts(count: number = 8): Promise<Post[]> {
    const data = await fetchJson<
        Array<{ id: number; titleSv: string; contentSv: string }>
    >(`https://chalmers.it/api/news?pageSize=${count}`)

    if (!data) {
        return []
    }

    return data.map(post => ({
        id: post.id,
        title: post.titleSv,
        body: unmark(stripHtml(post.contentSv)),
        url: `https://chalmers.it/news/${post.id}`,
    }))
}

export function findLocation(body: string): string {
    const patterns = [
        /^.{0,10}\b(?:vart?|plats|location)\s*[-:?]?\s*(.+)/im,
        /\bHubben\b/i,
        /\bStorhubben\b/i,
        /\bSandlådan\b/i,
        /\bCTC\b/i,
        /\bE[- ]?Studion?\b/i,
        /\b(?:SB[- ]?)?Multisal(?:en)?\b/i,
    ]

    for (const pattern of patterns) {
        const match = body.match(pattern)
        if (!match) {
            continue
        }

        if (match[1]) {
            return match[1].trim()
        }

        return match[0].trim()
    }

    return 'TBD'
}

export function createEventDraft(post: Post): EventDraft {
    const summary = post.title.trim() || 'Untitled event'
    const body = post.body || 'No description provided.'
    const location = findLocation(body)
    const { start, end, allDay } = extractDateRange(body)

    return {
        summary,
        description: body,
        location,
        start,
        end,
        allDay,
    }
}

function extractDateRange(body: string): {
    start: Date
    end: Date
    allDay: boolean
} {
    const today = new Date()
    const dateMatch =
        body.match(/(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?/) ??
        body.match(
            /(\d{1,2})\s+(januari|februari|mars|april|maj|juni|juli|augusti|september|oktober|november|december)/i
        ) ??
        body.match(new RegExp(`(?:${weekdayNames.join('|')})`, 'i'))

    let year = today.getFullYear()
    let month = today.getMonth() + 1
    let day = today.getDate()

    if (dateMatch) {
        if (dateMatch[1] && dateMatch[2] && !dateMatch[3]) {
            month = Number(dateMatch[1])
            day = Number(dateMatch[2])
        } else if (dateMatch[1] && dateMatch[2] && dateMatch[3]) {
            month = Number(dateMatch[1])
            day = Number(dateMatch[2])
            year = Number(
                dateMatch[3].length === 2 ? `20${dateMatch[3]}` : dateMatch[3]
            )
        } else if (dateMatch[2] && dateMatch[1]) {
            const monthName = dateMatch[2].toLowerCase()
            const monthIndex = monthNames.indexOf(monthName)
            if (monthIndex >= 0) {
                month = monthIndex + 1
                day = Number(dateMatch[1])
            }
        }
    }

    const weekdayIndex = weekdayNames.findIndex(dayName =>
        body.toLowerCase().includes(dayName)
    )

    if (weekdayIndex >= 0 && !dateMatch) {
        const currentWeekday = today.getDay()
        const target = weekdayIndex
        let diff = (target - currentWeekday + 7) % 7
        if (diff === 0 && today.getHours() > 20) {
            diff = 7
        }

        const next = new Date(today)
        next.setDate(today.getDate() + diff)
        year = next.getFullYear()
        month = next.getMonth() + 1
        day = next.getDate()
    }

    const timeMatch = body.match(/(\d{1,2})[:.](\d{2})/)
    const hour = timeMatch ? Number(timeMatch[1]) : 17
    const minutes = timeMatch ? Number(timeMatch[2]) : 0

    const start = new Date(year, month - 1, day, hour, minutes)
    const end = new Date(start.getTime() + 60 * 60 * 1000)

    return {
        start,
        end,
        allDay: false,
    }
}

export function createGoogleCalendarUrl(event: EventDraft): string {
    const start = formatCalendarDate(event.start)
    const end = formatCalendarDate(event.end)
    const url = new URL('https://calendar.google.com/calendar/render')

    url.searchParams.set('action', 'TEMPLATE')
    url.searchParams.set('text', event.summary)
    url.searchParams.set('details', event.description)
    url.searchParams.set('location', event.location)
    url.searchParams.set('dates', `${start}/${end}`)

    return url.toString()
}

function formatCalendarDate(date: Date): string {
    return date
        .toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d{3}Z$/, 'Z')
}
