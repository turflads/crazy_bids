/**
 * Converts a grade name to a valid CSS class suffix
 * Examples:
 *   "A" → "a"
 *   "B+" → "b-plus"
 *   "40+A" → "40-plus-a"
 *   "CATEGORY A" → "category-a"
 */
export function gradeToClassName(grade: string): string {
  return grade
    .toLowerCase()
    .replace(/\+/g, '-plus')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Get the background color class for a grade badge
 */
export function getGradeBgClass(grade: string, isComplete: boolean = false): string {
  if (isComplete) {
    return 'bg-auction-sold';
  }
  return `bg-grade-${gradeToClassName(grade)}`;
}
