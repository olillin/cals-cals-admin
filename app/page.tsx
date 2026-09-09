import CalendarTable from './ui/CalendarTable'

export default async function Page() {
    return (
        <section className="w-full">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Calendar Manager
            </h2>
            <CalendarTable />
        </section>
    )
}
