import { cn } from "@/lib/utils";

export function Logo() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="PortaiLIQ"
      className={cn("inline-block")}
    >
      <rect width="32" height="32" rx="8" fill="#3B82F6" />
      <path
        d="M8 16L13 21L24 10"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
