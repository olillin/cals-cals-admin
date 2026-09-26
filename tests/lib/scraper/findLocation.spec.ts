import { it, expect } from 'vitest'

import { findLocation, unmark } from '@/lib/scraper'

import cases from './resources/cases.json'
import { caseSchema } from './resources/casesSchema'

function errorWithBody(message: string, body: string): string {
    return message + '. Body:\n\n' + body + '\n\n'
}

it('parses each case successfully', () => {
    cases.forEach(rawCase => {
        const parsedCase = caseSchema.parse(rawCase)
        const body = unmark(parsedCase.post.body)

        const expectedLocation: string | null = parsedCase.data.location

        const location = findLocation(body)

        expect(
            location,
            errorWithBody('Incorrect location', body)
        ).toStrictEqual(expectedLocation)
    })
})
