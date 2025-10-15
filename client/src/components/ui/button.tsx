import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-[#FF6F3C] text-white hover:bg-[#FF6F3C]/90 hover:scale-105 hover:shadow-lg shadow-sm transition-all duration-200 ease-in-out",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-[#8B0000] bg-background hover:bg-[#FFF8E7] hover:text-[#8B0000] hover:shadow-md hover:scale-105 transition-all duration-200 ease-in-out",
        secondary:
          "bg-[#00A8E8] text-white hover:bg-[#00A8E8]/80 hover:scale-105 hover:shadow-lg transition-all duration-200 ease-in-out",
        ghost: "hover:bg-[#FFF8E7] hover:text-[#8B0000] hover:scale-105 transition-all duration-200 ease-in-out",
        link: "text-[#FF6F3C] underline-offset-4 hover:underline hover:text-[#FF6F3C]/80 transition-colors duration-200",
        spiritual: "bg-[#8B0000] text-[#FFD700] hover:bg-[#8B0000]/90 hover:shadow-lg hover:shadow-[#FFD700]/20 hover:scale-105 shadow-md transition-all duration-200 ease-in-out",
        golden: "bg-[#FFD700] text-[#8B0000] hover:bg-[#FFD700]/90 hover:shadow-lg hover:shadow-[#FFD700]/30 hover:scale-105 shadow-sm transition-all duration-200 ease-in-out",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }