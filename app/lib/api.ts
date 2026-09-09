import { NextResponse } from 'next/server'

export function createApiError(code: number, message: string) {
    return NextResponse.json({ error: { message, code } }, { status: code })
}
