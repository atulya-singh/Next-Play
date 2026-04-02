import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getPositionBetween(
  before: number | null,
  after: number | null,
): number {
  if (before === null && after === null) return 1
  if (before === null) return after! - 1
  if (after === null) return before + 1
  return (before + after) / 2
}
