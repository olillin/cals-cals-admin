import Link from 'next/link'

export function PageNavigation() {
    return (
        <nav
            aria-label="Main navigation"
            className="mb-8 flex h-16 overflow-hidden rounded-[1.25em] border border-white/10 bg-[#0a0a0a]"
        >
            <Link
                href="/"
                className="flex flex-1 items-center justify-center border-2 border-transparent text-sm font-medium text-[#00edda] shadow-[inset_0_0_0.5em_#00edda]"
            >
                Home
            </Link>
            <Link
                href="/"
                className="flex flex-1 items-center justify-center border-2 border-transparent text-sm font-medium text-white/80 transition-colors hover:text-[#00edda]"
            >
                Draft event
            </Link>
        </nav>
    )
}
