import { getLatestPosts } from '@/app/lib/scraper'
import { CalendarDraft } from '@/app/ui/CalendarDraft'

export default async function HomePage() {
    const posts = await getLatestPosts(8)

    return (
        <section className="w-full">
            <div className="mb-5 flex items-center justify-between">
                <div>
                    <p className="mb-2 text-[0.72rem] font-medium tracking-[0.12em] text-[#00edda] uppercase">
                        Latest from chalmers.it
                    </p>
                    <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                        Draft a calendar event
                    </h2>
                </div>
            </div>

            <CalendarDraft posts={posts} />
        </section>
    )
}
