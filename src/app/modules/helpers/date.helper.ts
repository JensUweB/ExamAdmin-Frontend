export function normalizeDate(input: Date): String {
    const date = new Date(input);
    return date.toLocaleDateString();
}

export function normalizeDateTime(input: Date): String {
    const date = new Date(input);
    return date.toLocaleDateString()+' '+date.toLocaleTimeString();
}