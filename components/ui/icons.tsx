import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

/** Solid house with a door cut-out — the active Home tab in the reference. */
export function HomeSolidIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M10.73 2.62a2 2 0 0 1 2.54 0l7 5.83A2 2 0 0 1 21 10v9.5a1.5 1.5 0 0 1-1.5 1.5H15v-6a1.5 1.5 0 0 0-1.5-1.5h-3A1.5 1.5 0 0 0 9 15v6H4.5A1.5 1.5 0 0 1 3 19.5V10a2 2 0 0 1 .73-1.55Z"
      />
    </svg>
  );
}
