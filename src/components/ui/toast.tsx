import * as React from "react";
import { cn } from "@/lib/utils";

const Toast = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "fixed bottom-4 right-4 z-50 rounded-lg border bg-white p-4 shadow-lg",
      className
    )}
    {...props}
  />
));
Toast.displayName = "Toast";

export { Toast };
