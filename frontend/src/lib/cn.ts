import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Class joiner, with tailwind-merge taught about our custom scales.
 *
 * WHY THE EXTENSION IS REQUIRED
 *   `text-*` is ambiguous in Tailwind: it sets either a font size or a text
 *   colour. tailwind-merge resolves that by checking the value against the font
 *   sizes it knows about — and it only knows the DEFAULT scale. Our custom sizes
 *   (`text-giant`, `text-mega`, `text-statement`, `text-marquee`, …) were
 *   therefore classified as colours, so `cn('text-marquee', 'text-ink')`
 *   silently dropped the size and left the element at 16px.
 *
 *   That is exactly what happened to the service marquee: it rendered at body
 *   size instead of 57px, with no error anywhere. Registering the scales below
 *   makes the size and the colour separate groups again, so both survive.
 *
 *   Keep this list in sync with `fontSize` in tailwind.config.ts.
 */
const CUSTOM_FONT_SIZES = [
  '2xs',
  'display',
  'headline',
  'title',
  'lead',
  'giant',
  'mega',
  'statement',
  'marquee',
  'numeral'
] as const;

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: [...CUSTOM_FONT_SIZES] }]
    }
  }
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
