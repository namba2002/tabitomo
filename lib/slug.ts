export function nameToSlug(name: string): string {
  return name.trim().replace(/\s+/g, "-");
}
