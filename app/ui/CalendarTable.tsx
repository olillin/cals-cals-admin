'use client'

import { AlertDialog, Button, toast } from '@heroui/react'
import clsx from 'clsx'
import { CloudSync, Plus, Trash } from 'lucide-react'
import { ReactNode } from 'react'

import {
    createCalendar,
    deleteCalendar,
    updateCalendar,
} from '@/app/actions/calendar'
import { Calendar } from '@/app/generated/prisma/client'

import { useCalendars } from '../hooks/useCalendars'
import { prettyFormatDate } from '../lib/util'
import { CopyBox } from './CopyBox'
import NewCalendarModal from './NewCalendarModal'

export default function CalendarTable() {
    const [calendars, refreshCalendars] = useCalendars()

    if (calendars === null) {
        return <span className="mx-auto text-center">Loading...</span>
    }

    return (
        <div className="my-8 w-full">
            <table className="mb-4 grid w-full gap-4">
                <thead>
                    <TableRow heading>
                        <TableHeader>Id</TableHeader>
                        <TableHeader>Filename</TableHeader>
                        <TableHeader>Hash</TableHeader>
                        <TableHeader>URL</TableHeader>
                        <TableHeader>Updated</TableHeader>
                        <TableHeader>Created</TableHeader>
                        <TableHeader></TableHeader>
                    </TableRow>
                </thead>

                <tbody className="grid">
                    {calendars.map(calendar => (
                        <TableRow key={calendar.id}>
                            <TableCell>{calendar.id}</TableCell>
                            <TableCell>{calendar.filename}</TableCell>
                            <TableCell>
                                <CopyBox value={calendar.hash} />
                            </TableCell>
                            <TableCell>
                                {calendar.externalUrl ? (
                                    <CopyBox value={calendar.externalUrl} />
                                ) : (
                                    <span className="text-white/60 italic">
                                        No value
                                    </span>
                                )}
                            </TableCell>
                            <TableCell>
                                {prettyFormatDate(calendar.updatedAt)}
                            </TableCell>
                            <TableCell>
                                {prettyFormatDate(calendar.createdAt)}
                            </TableCell>
                            <TableCell className="flex justify-end gap-2">
                                {calendar.externalUrl &&
                                    calendar.hash !== calendar.remoteHash && (
                                        <UpdateButton
                                            calendar={calendar}
                                            onUpdate={refreshCalendars}
                                        />
                                    )}
                                <DeleteButton
                                    calendar={calendar}
                                    onDelete={refreshCalendars}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </tbody>
            </table>

            <div className="flex justify-center">
                <NewCalendarModal
                    onCreate={input => {
                        createCalendar(input)
                            .then(() => {
                                refreshCalendars()
                            })
                            .catch(reason => {
                                console.warn(
                                    `Calendar could not be created: ${reason}`
                                )

                                toast('Failed to create calendar', {
                                    variant: 'warning',
                                    description: reason.toString(),
                                })
                            })
                    }}
                >
                    <Button size="lg">
                        <Plus />
                        Add calendar
                    </Button>
                </NewCalendarModal>
            </div>
        </div>
    )
}

function TableRow({
    children,
    heading,
}: {
    children?: ReactNode
    heading?: boolean
}) {
    return (
        <tr
            className={clsx(
                'grid grid-cols-[1fr_2fr_2fr_3fr_2fr_2fr_14em] content-center gap-4',
                {
                    'border-t-2 py-4': !heading,
                }
            )}
        >
            {children}
        </tr>
    )
}

function TableHeader({ children }: { children?: ReactNode }) {
    return <th className="text-left text-lg font-semibold">{children}</th>
}

function TableCell(props: { children?: ReactNode; className?: string }) {
    return (
        <td className={'content-center ' + props.className}>
            {props.children}
        </td>
    )
}

function UpdateButton(props: { calendar: Calendar; onUpdate?: () => void }) {
    function action() {
        updateCalendar(props.calendar.id)
            .then(() => {
                toast.success(
                    <span>
                        Calendar <strong>{props.calendar.filename}</strong> has
                        been updated
                    </span>
                )
                props.onUpdate?.()
            })
            .catch(reason => {
                console.warn(`Calendar could not be updated: ${reason}`)

                toast('Calendar failed to be updated', {
                    variant: 'warning',
                    description: reason.toString(),
                })
            })
    }
    return (
        <Button variant="primary" onClick={action}>
            <CloudSync />
            Update
        </Button>
    )
}

function DeleteButton(props: { calendar: Calendar; onDelete?: () => void }) {
    function action() {
        deleteCalendar(props.calendar.id)
            .then(() => {
                toast.danger(
                    <span>
                        Calendar <strong>{props.calendar.filename}</strong> has
                        been deleted
                    </span>,
                    {
                        indicator: <Trash />,
                    }
                )
                props.onDelete?.()
            })
            .catch(reason => {
                console.warn(`Calendar could not be deleted: ${reason}`)

                toast('Calendar failed to be deleted', {
                    variant: 'warning',
                    actionProps: (
                        <Button variant="danger-soft" onClick={action}>
                            Try again
                        </Button>
                    ),
                    description: reason,
                })
            })
    }

    return (
        <AlertDialog>
            <Button variant="danger">
                <Trash />
                Delete
            </Button>
            <AlertDialog.Backdrop>
                <AlertDialog.Container>
                    <AlertDialog.Dialog className="sm:max-w-[400px]">
                        <AlertDialog.CloseTrigger />
                        <AlertDialog.Header>
                            <AlertDialog.Icon status="danger" />
                            <AlertDialog.Heading>
                                Delete Calendar?
                            </AlertDialog.Heading>
                        </AlertDialog.Header>
                        <AlertDialog.Body>
                            <p>
                                This will permanently delete{' '}
                                <strong>{props.calendar.filename}</strong> and
                                all of its data. This action cannot be undone.
                            </p>
                        </AlertDialog.Body>
                        <AlertDialog.Footer>
                            <Button slot="close" variant="tertiary">
                                Cancel
                            </Button>
                            <Button
                                slot="close"
                                variant="danger"
                                onClick={action}
                            >
                                Delete Calendar
                            </Button>
                        </AlertDialog.Footer>
                    </AlertDialog.Dialog>
                </AlertDialog.Container>
            </AlertDialog.Backdrop>
        </AlertDialog>
    )
}
