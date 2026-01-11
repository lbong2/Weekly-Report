export * from './date';
export * from './format';
export * from './validation';

// shadcn/ui utility (기존 utils.ts 통합)
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
