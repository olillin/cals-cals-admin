'use server'

import { CalendarCreateInput } from '@/app/generated/prisma/models'
import { prisma } from '@/app/lib/prisma'

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
