import type { Calendar } from '@/app/generated/prisma/client'

import { prisma } from '@/app/lib/prisma'

export async function getAllCalendars(): Promise<Calendar[]> {
    return prisma.calendar.findMany({ orderBy: { id: 'asc' } })
}

export function validateCalendar(filename: string, hash: string): boolean {
    return false
}
