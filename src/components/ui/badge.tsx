import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border-2 px-3 py-1 text-xs font-semibold backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-primary bg-transparent text-primary shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_25px_rgba(59,130,246,0.7)]",
        secondary:
          "border-secondary bg-transparent text-secondary shadow-[0_0_15px_rgba(100,116,139,0.3)] hover:shadow-[0_0_25px_rgba(100,116,139,0.5)]",
        destructive:
          "border-destructive bg-transparent text-destructive shadow-[0_0_15px_rgba(239,68,68,0.5)] hover:shadow-[0_0_25px_rgba(239,68,68,0.7)]",
        success:
          "border-success bg-transparent text-success shadow-[0_0_15px_rgba(34,197,94,0.5)] hover:shadow-[0_0_25px_rgba(34,197,94,0.7)]",
        warning:
          "border-warning bg-transparent text-warning shadow-[0_0_15px_rgba(251,146,60,0.5)] hover:shadow-[0_0_25px_rgba(251,146,60,0.7)]",
        outline: "border-foreground/20 bg-transparent text-foreground hover:border-foreground/40",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
