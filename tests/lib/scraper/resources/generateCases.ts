import fs from 'node:fs'

import { getLatestPosts } from '@/lib/scraper'

const outputFile = 'cases.json'

if (fs.existsSync(outputFile)) {
    console.error(`${outputFile} already exists`)
    process.exit()
}

const now = new Date()
const templateDate = `${now.getFullYear()}-MM-DDThh:mm:00.000Z`

const posts = await getLatestPosts(50)
const cases = posts.map(post => ({
    post,
    data: {
        start: templateDate,
        end: templateDate,
        allDay: false,
        location: null,
    },
}))
fs.writeFileSync(outputFile, JSON.stringify(cases, null, 2))

console.log('Done')
