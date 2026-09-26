/**
 * Format a date as YYYY-MM-DD hh:mm in Sweden.
 * @param date The date to format.
 * @returns The formatted date.
 */
export function prettyFormatDate(date: Date): string {
    return new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'Europe/Stockholm',
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date)
}
