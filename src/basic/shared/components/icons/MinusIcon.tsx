import type { SVGProps } from "react";

type MinusIconProps = SVGProps<SVGSVGElement>;

export function MinusIcon({ className = "w-6 h-6", ...rest }: MinusIconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...rest}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
    </svg>
  );
}
