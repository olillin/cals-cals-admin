import z from 'zod'

import { errorSchema } from '@/lib/api'

export const responseSchema = z
    .object({
        hash: z.string(),
    })
    .or(errorSchema)
