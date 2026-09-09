'use client'

import clsx from 'clsx'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

export function PageNavigation() {
    return (
        <nav
            aria-label="Main navigation"
            className="mb-8 flex h-16 overflow-hidden rounded-[1.25em] border border-white/10 bg-[#0a0a0a]"
        >
            <NavigationItem href="/">Calendars</NavigationItem>
            <NavigationItem href="/scraper">Scrape events</NavigationItem>
        </nav>
    )
}

function NavigationItem({
    children,
    href,
}: {
    children?: ReactNode
    href: string
}) {
    const pathname = usePathname()
    const selected = pathname === href

    return (
        <Link
            href={href}
            className={clsx(
                'flex flex-1 items-center justify-center border-2 border-transparent text-sm font-medium',
                {
                    'text-[#00edda] shadow-[inset_0_0_0.5em_#00edda]': selected,
                    'text-white/80 transition-colors hover:text-[#00edda]':
                        !selected,
                }
            )}
        >
            {children}
        </Link>
    )
}
