import * as React from "react"

import { cn } from "@/lib/utils"

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-12 w-full rounded-xl border border-black/20 bg-white/90 px-4 py-2 text-sm text-black shadow-sm backdrop-blur-sm focus:outline-none focus:ring-primary/60 focus:ring-offset-1 focus:border-primary hover:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 ease-in-out",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    )
  }
)
Select.displayName = "Select"

export { Select }