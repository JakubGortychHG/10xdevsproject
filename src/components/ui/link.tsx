import * as React from "react";
import { cn } from "@/lib/utils";

/* eslint-disable react/prop-types */
const Link = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement>
>(({ className, children, ...props }, ref) => {
  return (
    <a
      className={cn(
        "text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        className,
      )}
      ref={ref}
      {...props}
    >
      {children}
    </a>
  );
});
/* eslint-enable react/prop-types */

Link.displayName = "Link";

export { Link };
