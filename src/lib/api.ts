import { NextResponse } from 'next/server'
import z from 'zod'

export const errorSchema = z.object({
    error: z.object({
        message: z.string().nonempty(),
        code: z.int().min(100),
    }),
})

export type ApiError = z.infer<typeof errorSchema>

export function createApiError(
    code: number,
    message: string
): NextResponse<ApiError> {
    const body: unknown = { error: { message, code } }
    return NextResponse.json(errorSchema.parse(body), { status: code })
}

export function isApiError(maybeApiError: unknown): maybeApiError is ApiError {
    return errorSchema.safeParse(maybeApiError).success
}
