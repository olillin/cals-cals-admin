import { NextResponse } from 'next/server'

import type { Calendar } from '@/generated/prisma/client'

import {
    fetchCalendarFile,
    getAllCalendars,
    hashCalendar,
} from '@/lib/calendar'

export async function GET(): Promise<NextResponse> {
    const calendars = await getAllCalendars()

    const calendarsWithHashes = await Promise.all(
        calendars.map(async calendar => {
            const remoteHash = await fetchRemoteHash(calendar).catch(reason => {
                console.warn(
                    `Failed to get remote hash from ${calendar.externalUrl}: ${reason}`
                )
                return null
            })
            return {
                ...calendar,
                remoteHash,
            }
        })
    )

    return NextResponse.json(calendarsWithHashes)
}

async function fetchRemoteHash(calendar: Calendar): Promise<string | null> {
    if (!calendar.externalUrl) {
        return null
    }

    const content = await fetchCalendarFile(calendar.externalUrl)
    return hashCalendar(content)
}
