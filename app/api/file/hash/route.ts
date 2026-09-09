import { NextRequest, NextResponse } from 'next/server'

import { createApiError } from '@/app/lib/api'
import { readCalendarFileHash } from '@/app/lib/calendar'
import { filenamePattern } from '@/app/lib/patterns'

export async function GET(req: NextRequest) {
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

    return NextResponse.json({ hash })
}
