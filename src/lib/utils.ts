import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** USD with cents, or two significant digits below $1 (e.g. "$0.012"). */
export const usd = (n: number) =>
  "$" + (Math.abs(n) >= 1 ? n.toLocaleString("en-US", { maximumFractionDigits: 2 }) : n.toPrecision(2).replace(/\.?0+$/, ""));

/** Whole-cent amounts, e.g. "$0.50"; `usd` would print "$0.5". */
export const cents = (n: number) => (n >= 1 ? usd(n) : `$${n.toFixed(2)}`);
