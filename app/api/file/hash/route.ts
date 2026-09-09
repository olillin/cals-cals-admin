import { NextRequest, NextResponse } from 'next/server'

import { createApiError } from '@/app/lib/api'

export async function GET(req: NextRequest) {
    const filename = req.nextUrl.searchParams.get('filename')
    if (!filename) {
        return createApiError(400, "Missing required parameter 'filename'")
    }
    if (!/^[A-Z0-9_.-]+$/i.test(filename)) {
        return createApiError(400, 'Invalid filename')
    }
    return NextResponse.json({
        hash: 'MY_HASH',
    })
}
