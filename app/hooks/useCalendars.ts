import { useEffect, useState } from 'react'
import z from 'zod'

import { Calendar } from '@/app/generated/prisma/client'

const calendarsSchema = z.array(
    z.object({
        id: z.int(),
        filename: z.string(),
        externalUrl: z.url().or(z.null()),
        hash: z.string(),
        pickerId: z.int().or(z.null()),
        createdAt: z.coerce.date(),
        updatedAt: z.coerce.date(),
    })
)

export function useCalendars(): [null | Calendar[], () => void] {
    const [calendars, setCalendars] = useState<null | Calendar[]>(null)

    function refreshCalendars() {
        fetch('/api/calendars')
            .then(res => res.json())
            .then(json => calendarsSchema.parse(json))
            .then(value => setCalendars(value))
    }

    useEffect(() => {
        refreshCalendars()
    }, [])

    return [calendars, refreshCalendars]
}
