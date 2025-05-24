import * as React from "react";
import { cn } from "@/lib/utils";

export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  asChild?: boolean;
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, asChild = false, ...props }, ref) => {
    return (
      <a
        className={cn(
          "text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);

Link.displayName = "Link";

export { Link };
