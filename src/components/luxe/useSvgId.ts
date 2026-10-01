import { useId } from "react";

/** A DOM/SVG-safe unique id — React's useId contains ':' which breaks
 *  `url(#id)` references on web. */
export function useSvgId(prefix: string): string {
  return `${prefix}${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
}
