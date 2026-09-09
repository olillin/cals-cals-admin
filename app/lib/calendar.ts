import { CalendarEvent, Component, parseCalendar } from 'iamcal'
import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import * as path from 'node:path'

import type { Calendar } from '@/app/generated/prisma/client'

import { prisma } from '@/app/lib/prisma'

import { filenamePattern } from './patterns'

export async function getAllCalendars(): Promise<Calendar[]> {
    return prisma.calendar.findMany({ orderBy: { id: 'asc' } })
}

export function getCalendarFilePath(filename: string): string {
    return path.join('data/calendars', filename)
}

export async function validateCalendar(
    filename: string,
    hash: string
): Promise<boolean> {
    const newHash = await readCalendarFileHash(filename)
    return newHash === hash
}

export async function readCalendarFile(filename: string): Promise<string> {
    if (!filenamePattern.test(filename)) {
        throw new Error('Refusing to read calendar file, unexpected filename')
    }
    return readFile(getCalendarFilePath(filename), 'utf8')
}

export function hashCalendar(content: string): string {
    // Remove the DTSTAMP as it often set to the fetched time
    const calendar = parseCalendar(content)
    calendar.components.forEach(component => {
        component.removePropertiesWithName('DTSTAMP')
    })
    const serialized = calendar.serialize()

    return createHash('sha256').update(serialized).digest('hex')
}

export async function readCalendarFileHash(filename: string): Promise<string> {
    const content = await readCalendarFile(filename)
    return hashCalendar(content)
}

export async function fetchCalendarFile(
    url: string,
    sort: boolean = true
): Promise<string> {
    const content = await fetch(url).then(response => {
        if (!response.ok) {
            throw new Error(
                `Server responded with error code ${response.status}`
            )
        }
        const type = response.headers.get('content-type')
        if (!type?.includes('text/calendar')) {
            throw new Error('Server responded with not a calendar')
        }

        return response.text()
    })

    if (sort) {
        const calendar = parseCalendar(content)
        const events = calendar.getEvents()
        const components = calendar.components.filter(
            component => component.name !== 'VEVENT'
        )

        function hash(event: CalendarEvent): number {
            const clone = new CalendarEvent(event)
            clone.removePropertiesWithName('DTSTAMP')
            return createHash('sha256')
                .update(clone.serialize())
                .digest()
                .readInt32BE()
        }

        events.sort(
            (a, b) =>
                b.getStart().getDate().getTime() -
                    a.getStart().getDate().getTime() || hash(a) - hash(b)
        )

        const newCalendar = new Component(
            'VCALENDAR',
            calendar.properties,
            components.concat(events)
        )
        return newCalendar.serialize()
    }

    return content
}

export async function writeCalendarFile(
    filename: string,
    content: string
): Promise<void> {
    if (!filenamePattern.test(filename)) {
        throw new Error('Refusing to write calendar file, unexpected filename')
    }
    await writeFile(getCalendarFilePath(filename), content)
}
