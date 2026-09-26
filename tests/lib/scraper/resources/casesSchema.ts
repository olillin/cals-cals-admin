import z from 'zod'

export const savedPostSchema = z.object({
    id: z.int(),
    title: z.string(),
    body: z.string(),
    url: z.url().optional(),
    postedDate: z.iso.datetime({ local: false }),
})

export const savedDataSchema = z.object({
    start: z.iso.datetime({ local: false }),
    end: z.iso.datetime({ local: false }).or(z.null()),
    allDay: z.boolean(),
    location: z.string().or(z.null()),
})

export const caseSchema = z.object({
    post: savedPostSchema,
    data: savedDataSchema,
})
