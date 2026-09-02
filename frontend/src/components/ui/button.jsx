import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--accent] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[--accent] text-white hover:bg-[--accent-dark] active:scale-[0.98]",
        destructive: "bg-[--danger] text-white hover:opacity-90 active:scale-[0.98]",
        outline: "border border-[--border] bg-white text-[--text-primary] hover:bg-gray-50 active:scale-[0.98]",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 active:scale-[0.98]",
        ghost: "text-[--text-primary] hover:bg-gray-100 active:scale-[0.98]",
        link: "text-[--accent] underline-offset-4 hover:underline",
        success: "bg-[--success] text-white hover:opacity-90 active:scale-[0.98]",
        warning: "bg-[--warning] text-white hover:opacity-90 active:scale-[0.98]",
        info: "bg-[--info] text-white hover:opacity-90 active:scale-[0.98]",
        gov: "bg-[--gov-accent] text-white hover:bg-[--gov-accent-light] active:scale-[0.98]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-10 w-10",
        xs: "h-6 px-2 text-xs rounded",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, ...props }, ref) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }