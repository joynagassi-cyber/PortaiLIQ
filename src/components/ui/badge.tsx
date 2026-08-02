import { cn } from "@/lib/utils";
import * as React from "react";

const Badge = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    variant?: "default" | "secondary" | "outline" | "success" | "warning" | "destructive"
  }
>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-secondary text-foreground border border-border",
      secondary: "bg-muted text-muted-foreground border border-border",
      outline: "bg-transparent text-foreground border border-input",
      success: "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-300 border border-green-200 dark:border-green-800",
      warning: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800",
      destructive: "bg-destructive/10 text-destructive border border-destructive/20",
    };
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
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
