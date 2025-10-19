import * as React from "react"

import { cn } from "@/lib/utils"

type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-xl border border-black/20 bg-white/90 px-4 py-2 text-sm text-black placeholder:text-black/40 shadow-sm backdrop-blur-sm focus:outline-none focus:ring-primary/60 focus:ring-offset-1 focus:border-primary hover:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 ease-in-out",
          className
        )}
        ref={ref}
        {...props}
      />

    )
  }
)
Input.displayName = "Input"

export { Input }