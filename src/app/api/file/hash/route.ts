import { NextRequest, NextResponse } from 'next/server'

import { createApiError } from '@/lib/api'
import { readCalendarFileHash } from '@/lib/calendar'
import { filenamePattern } from '@/lib/patterns'

import { responseSchema } from './schema'

export async function GET(req: NextRequest): Promise<NextResponse> {
    const filename = req.nextUrl.searchParams.get('filename')
    if (!filename) {
        return createApiError(400, "Missing required parameter 'filename'")
    }
    if (!filenamePattern.test(filename)) {
        return createApiError(400, 'Invalid filename')
    }

    const hash = await readCalendarFileHash(filename).catch(reason => {
        return createApiError(500, `Failed to get hash: ${reason}`)
    })

    if (typeof hash !== 'string') {
        // Return error
        return hash
    }

    const body: unknown = { hash }
    return NextResponse.json(responseSchema.parse(body))
}
