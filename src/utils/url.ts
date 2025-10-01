/**
 * Convert a title to a URL-friendly slug
 */
export function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove special characters except hyphens
    .replace(/[^\w\-]+/g, '')
    // Remove multiple consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
}

/**
 * Convert a URL slug back to a searchable title pattern
 */
export function slugToTitlePattern(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .toLowerCase()
    .trim();
}

/**
 * Check if a title matches a slug
 */
export function titleMatchesSlug(title: string, slug: string): boolean {
  const titleSlug = titleToSlug(title);
  return titleSlug === slug;
}
