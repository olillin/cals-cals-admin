import { useEffect, useState } from 'react'
import z from 'zod'

export const calendarsSchema = z.array(
    z.object({
        id: z.int(),
        filename: z.string(),
        externalUrl: z.url().or(z.null()),
        remoteHash: z.string().or(z.null()),
        hash: z.string(),
        pickerId: z.int().or(z.null()),
        createdAt: z.coerce.date(),
        updatedAt: z.coerce.date(),
    })
)

export type Calendars = z.infer<typeof calendarsSchema>

export function useCalendars(): [null | Calendars, () => void] {
    const [calendars, setCalendars] = useState<null | z.infer<
        typeof calendarsSchema
    >>(null)

    function refreshCalendars(): void {
        fetch('/api/calendars')
            .then(res => res.json())
            .then(json => calendarsSchema.parse(json))
            .then(value => setCalendars(value))
            .catch(reason => {
                console.error(reason)
            })
    }

    useEffect(() => {
        refreshCalendars()
    }, [])

    return [calendars, refreshCalendars]
}
