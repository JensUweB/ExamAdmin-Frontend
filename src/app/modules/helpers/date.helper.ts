export function normalizeDate(date: Date): String {
    return date.getDay()+'.'+date.getMonth()+'.'+date.getFullYear();
}