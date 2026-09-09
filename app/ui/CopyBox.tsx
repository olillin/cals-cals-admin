import { toast } from '@heroui/react'
import { Copy } from 'lucide-react'
import { useRef } from 'react'

export function CopyBox({ value }: { value: string }) {
    const input = useRef<HTMLInputElement>(null)

    function copyUrl() {
        if (!input.current) return

        input.current.select()
        input.current.setSelectionRange(0, 99999) // For mobile devices

        navigator.clipboard.writeText(input.current.value)

        input.current.setSelectionRange(0, 0)

        toast.success('Value copied')
    }

    return (
        <div className="grid grid-cols-[1fr_max-content] gap-4 rounded-full border-1 bg-black/30 px-3 py-2">
            <input
                ref={input}
                type="text"
                disabled
                value={value}
                className="min-w-0 truncate bg-linear-to-r from-white from-80% to-transparent bg-clip-text text-clip text-transparent"
            />
            <button className="cursor-pointer" onClick={copyUrl}>
                <Copy />
            </button>
        </div>
    )
}
