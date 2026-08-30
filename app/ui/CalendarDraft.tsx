'use client'

import { useMemo, useState } from 'react'

import {
    createEventDraft,
    createGoogleCalendarUrl,
    type Post,
} from '@/app/lib/scraper'

import { prettyFormatDate } from '../lib/util'

export function CalendarDraft({ posts }: { posts: Post[] }) {
    const [selectedId, setSelectedId] = useState<number>(posts[0]?.id ?? 0)

    const selectedPost = useMemo(
        () => posts.find(post => post.id === selectedId) ?? posts[0] ?? null,
        [posts, selectedId]
    )

    const draft = useMemo(
        () => (selectedPost ? createEventDraft(selectedPost) : null),
        [selectedPost]
    )

    if (!posts.length || !selectedPost || !draft) {
        return (
            <p className="text-white/70">No Chalmers posts were available.</p>
        )
    }

    const calendarUrl = createGoogleCalendarUrl(draft)

    return (
        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="grid gap-3" aria-label="Available posts">
                {posts.map(post => {
                    const isSelected = post.id === selectedPost.id

                    return (
                        <button
                            key={post.id}
                            type="button"
                            className={[
                                'w-full rounded-[1.25em] border p-4 text-left transition-colors',
                                isSelected
                                    ? 'border-[#00edda] bg-[#00edda]/5 text-[#00edda] shadow-[inset_0_0_0.5em_#00edda]'
                                    : 'border-white/70 bg-transparent text-white hover:border-white/90',
                            ].join(' ')}
                            onClick={() => setSelectedId(post.id)}
                        >
                            <h3 className="mb-2 text-base font-medium">
                                {post.title}
                            </h3>
                            <p className="text-sm leading-5 text-white/70">
                                {post.body.slice(0, 120).replace(/\s+/g, ' ')}
                                ...
                            </p>
                        </button>
                    )
                })}
            </div>

            <article
                aria-live="polite"
                className="rounded-[1.25em] border border-white/70 bg-transparent p-5"
            >
                <p className="mb-2 text-[0.72rem] font-medium tracking-[0.12em] text-[#00edda] uppercase">
                    Drafted event
                </p>
                <h3 className="mb-1 text-xl font-semibold">{draft.summary}</h3>

                <div className="mt-4 grid gap-2 text-sm text-white/75">
                    <div>
                        <strong className="font-medium text-white">
                            Start:
                        </strong>{' '}
                        {prettyFormatDate(draft.start)}
                    </div>
                    <div>
                        <strong className="font-medium text-white">End:</strong>{' '}
                        {prettyFormatDate(draft.end)}
                    </div>
                    <div>
                        <strong className="font-medium text-white">
                            Location:
                        </strong>{' '}
                        {draft.location}
                    </div>
                </div>

                <div className="mt-5 leading-7 whitespace-pre-wrap text-white">
                    {draft.description}
                </div>

                <a
                    className="mt-5 inline-flex rounded-full bg-[#00edda] px-4 py-2 font-bold text-[#111111] no-underline"
                    href={calendarUrl}
                    target="_blank"
                    rel="noreferrer"
                >
                    Open in Google Calendar
                </a>
            </article>
        </div>
    )
}
