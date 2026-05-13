export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/['\u2019\u2018]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .replace(/-+/g, '-');
}

export function matchSlug(homeName: string, awayName: string): string {
  return `${toSlug(homeName)}-vs-${toSlug(awayName)}`;
}
