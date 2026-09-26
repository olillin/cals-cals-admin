import moment from 'moment'
import { it, expect } from 'vitest'

import { extractDateRange, unmark } from '@/lib/scraper'

import cases from './resources/cases.json'
import { caseSchema } from './resources/casesSchema'

function errorWithBody(message: string, body: string): string {
    return message + '. Body:\n\n' + body + '\n\n'
}

it('parses each case successfully', () => {
    cases.forEach(rawCase => {
        const parsedCase = caseSchema.parse(rawCase)
        const body = unmark(parsedCase.post.body)

        const expectedStart: Date = new Date(parsedCase.data.start)
        const expectedEnd: Date = parsedCase.data.end
            ? new Date(parsedCase.data.end)
            : moment(expectedStart).add(1, 'hour').toDate()
        const expectedAllDay: boolean = parsedCase.data.allDay

        const result = extractDateRange(
            body,
            new Date(parsedCase.post.postedDate)
        )
        if (result === null) {
            expect(
                null,
                errorWithBody('Failed to find start start', body)
            ).toStrictEqual(expectedStart)
            return
        }
        const { start, end, allDay } = result

        expect(start, errorWithBody('Incorrect start', body)).toStrictEqual(
            expectedStart
        )
        expect(end, errorWithBody('Incorrect end', body)).toStrictEqual(
            expectedEnd
        )
        expect(allDay, errorWithBody('Incorrect allDay', body)).toStrictEqual(
            expectedAllDay
        )
    })
})
