'use client'

import {
    Form,
    Button,
    FieldError,
    Fieldset,
    Input,
    Label,
    Modal,
    TextField,
    toast,
} from '@heroui/react'
import { CalendarPlus, CircleX } from 'lucide-react'
import { ReactNode } from 'react'

import { CalendarCreateInput } from '@/app/generated/prisma/models'

function getFileHash(filename: string) {
    return fetch(`/api/file/hash?filename=${filename}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error.message)
            } else {
                return data.hash
            }
        })
}

export default function NewCalendarModal(props: {
    children: ReactNode
    onCreate?: (input: CalendarCreateInput) => void
}) {
    const onSubmit =
        (closeModal: () => void) =>
        async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)

            const filename = formData.get('filename')!.toString()
            const hash = await getFileHash(filename).catch(reason => {
                toast('Failed to get hash', {
                    variant: 'danger',
                    indicator: <CircleX />,
                    description: reason,
                })
            })
            const externalUrl = formData.get('url')!.toString() || null

            props.onCreate?.({
                filename,
                hash,
                externalUrl,
            })

            closeModal()
        }

    return (
        <Modal>
            {props.children}
            <Modal.Backdrop>
                <Modal.Container>
                    <Modal.Dialog className="sm:max-w-[360px]">
                        {renderProps => (
                            <>
                                <Modal.CloseTrigger />
                                <Modal.Header>
                                    <Modal.Icon className="bg-default text-foreground">
                                        <CalendarPlus />
                                    </Modal.Icon>
                                    <Modal.Heading>New Calendar</Modal.Heading>
                                </Modal.Header>
                                <Modal.Body>
                                    <Form
                                        onSubmit={onSubmit(renderProps.close)}
                                    >
                                        <Fieldset>
                                            <Fieldset.Legend />
                                            <Fieldset.Group>
                                                <TextField
                                                    isRequired
                                                    name="filename"
                                                    type="text"
                                                    validate={value => {
                                                        if (
                                                            !/^[A-Z0-9._-]+$/i.test(
                                                                value
                                                            )
                                                        ) {
                                                            return 'Please provide a valid filename'
                                                        }

                                                        return null
                                                    }}
                                                >
                                                    <Label>Filename</Label>
                                                    <Input placeholder="cal.ics" />
                                                    <FieldError />
                                                </TextField>
                                                <TextField
                                                    name="url"
                                                    type="text"
                                                    validate={url => {
                                                        if (url === '')
                                                            return null

                                                        try {
                                                            new URL(url)
                                                        } catch {
                                                            return 'Please provide a valid URL'
                                                        }

                                                        return null
                                                    }}
                                                >
                                                    <Label>URL</Label>
                                                    <Input placeholder="https://example.com/calendars/cal.ics" />
                                                    <FieldError />
                                                </TextField>
                                            </Fieldset.Group>
                                            <Fieldset.Actions>
                                                <Button
                                                    type="submit"
                                                    className="w-full"
                                                >
                                                    Create
                                                </Button>
                                                <Button
                                                    className="w-full"
                                                    slot="close"
                                                    variant="tertiary"
                                                >
                                                    Cancel
                                                </Button>
                                            </Fieldset.Actions>
                                        </Fieldset>
                                    </Form>
                                </Modal.Body>
                                <Modal.Footer></Modal.Footer>
                            </>
                        )}
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    )
}
