'use server'

import { CalendarCreateInput } from '@/app/generated/prisma/models'
import { prisma } from '@/app/lib/prisma'

import {
    fetchCalendarFile,
    writeCalendarFile,
    hashCalendar,
} from '../lib/calendar'

export async function deleteCalendar(id: number) {
    await prisma.calendar.delete({
        where: {
            id: id,
        },
    })
}

export async function createCalendar(input: CalendarCreateInput) {
    await prisma.calendar.create({
        data: input,
    })
}

export async function updateCalendar(id: number) {
    const calendar = await prisma.calendar.findFirst({
        where: { id: id },
        select: {
            filename: true,
            externalUrl: true,
        },
    })
    if (!calendar) {
        throw new Error('Cannot update calendar, does not exist')
    }
    if (!calendar.externalUrl) {
        throw new Error('Cannot update calendar without external URL')
    }

    const newContent = await fetchCalendarFile(calendar.externalUrl)
    await writeCalendarFile(calendar.filename, newContent)
    const newHash = hashCalendar(newContent)

    await prisma.calendar.update({
        where: {
            id: id,
        },
        data: {
            hash: newHash,
        },
    })
}
