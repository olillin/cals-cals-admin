import { NextResponse } from 'next/server'

import { getAllCalendars } from '@/app/lib/calendar'

export async function GET() {
    const calendars = await getAllCalendars()
    return NextResponse.json(calendars)
}
