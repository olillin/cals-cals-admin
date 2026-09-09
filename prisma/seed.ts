import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '@/app/generated/prisma/client'

export {}

const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

await prisma.calendar.deleteMany({})

await prisma.calendar.createMany({
    data: [
        {
            filename: 'it.ics',
            hash: '20f841c79e2e8f4627e56ac3def9424433a3c0129bb7881fed19325c618f1429',
            pickerId: 0,
        },
        {
            filename: 'asp1.ics',
            hash: '521afc411f4d96f9491d9147410ac749ad85af549fc4aaccc6fa14f7fc3cfc71',
            pickerId: 1,
        },
        {
            filename: 'asp2.ics',
            hash: 'd7c73c6d19ee2593c1a3e1e8e1f6f496ccafe187061b649fe4b83f596ab4d16b',
            pickerId: 2,
        },
        {
            filename: 'cortege.ics',
            hash: '875dad503153167d709ecce573ab1cd78d0aef81b0eb55baa56a254ec184f6ec',
            pickerId: 3,
        },
    ],
})

await prisma.$disconnect()
