import z from 'zod'

import { errorSchema } from '@/app/lib/api'

export const responseSchema = z
    .object({
        hash: z.string(),
    })
    .or(errorSchema)
