import type { Metadata, Viewport } from 'next'

import './globals.css'
import { PageFooter } from '@/app/ui/PageFooter'
import { PageNavigation } from '@/app/ui/PageNavigation'

export const metadata: Metadata = {
    title: "Cal's Cals Admin Panel",
    description: 'Manage calendars and events from Chalmers posts.',
    applicationName: "Cal's Cals Admin Panel",
}

export const viewport: Viewport = {
    themeColor: '#111111',
    colorScheme: 'dark',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <body className="min-h-screen bg-[#111111] text-white">
                <div className="mx-auto min-h-screen w-full max-w-[700px] px-4 py-8 pb-16 md:px-0">
                    <header className="mb-6">
                        <h1 className="mb-2 text-4xl font-semibold tracking-tight md:text-5xl">
                            Cal&apos;s Cals Admin Panel
                        </h1>
                    </header>

                    <PageNavigation />
                    <main className="my-12">{children}</main>
                    <PageFooter />
                </div>
            </body>
        </html>
    )
}
