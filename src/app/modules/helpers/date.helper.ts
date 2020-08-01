export function normalizeDate(input: string): string {
    const date = new Date(input);
    const str: string[] = date.toLocaleDateString().split('.');
    return str[0].padStart(2, '0') + '.' + str[1].padStart(2, '0') + '.' + str[2];
}
