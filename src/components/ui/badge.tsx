import { cn } from "@/lib/utils";
import * as React from "react";

const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "success" | "warning" | "destructive" }
>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-blue-100 text-blue-800",
      success: "bg-green-100 text-green-800",
      warning: "bg-yellow-100 text-yellow-800",
      destructive: "bg-red-100 text-red-800",
    };
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge };
