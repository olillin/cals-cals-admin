import { createEnv } from '@t3-oss/env-nextjs'
import { readFileSync } from 'node:fs'
import * as z from 'zod'

export const defaultBaseUrl = 'http://localhost:3000'

function variableOrFile(
    name: string,
    o: NodeJS.ProcessEnv
): string | undefined {
    if (Object.hasOwn(o, name)) {
        return o[name]
    }
    const fileEnvName = name + '_FILE'
    if (Object.hasOwn(o, fileEnvName)) {
        const filename = o[fileEnvName]!
        return readFileSync(filename, 'utf8')
    }
}

export const env = createEnv({
    server: {
        NODE_ENV: z.enum(['production', 'development', 'test']),
        DATABASE_URL: z.string(),
    },
    shared: {
        BASE_URL: z
            .url({ normalize: true, protocol: /^https?$/ })
            .regex(/\/$/)
            .default(defaultBaseUrl),
        NEXT_PUBLIC_WEB_VERSION: z.string().optional(),
    },
    emptyStringAsUndefined: true,
    // Experimental settings infer runtime server variable values from names
    runtimeEnv: {
        NODE_ENV: variableOrFile('NODE_ENV', process.env),
        DATABASE_URL: variableOrFile('DATABASE_URL', process.env),
        BASE_URL: variableOrFile('BASE_URL', process.env),
        NEXT_PUBLIC_WEB_VERSION: process.env.NEXT_PUBLIC_WEB_VERSION,
    },
    // Skip validation with environment variable
    skipValidation: process.env.SKIP_ENV_VALIDATION === '1',
})
