export function normalizeDate(input: string): string {
    const date = new Date(input);
    return date.toLocaleDateString();
}

export function normalizeDateTime(input: string): string {
    const date = new Date(input);
    return date.toLocaleDateString()+' '+date.toLocaleTimeString();
}