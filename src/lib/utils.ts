import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getLabelsForView(
  _view: string,
  _range: { start: Date; end: Date }
): string[] {
  return [];
}
