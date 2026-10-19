import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border border-transparent bg-transparent px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-badge-primary/60 border-badge-primary text-badge-primary-foreground shadow",
        secondary:
          "bg-badge-secondary/60 border-badge-secondary text-badge-secondary-foreground shadow",
        destructive:
          "bg-badge-destructive/60 border-badge-destructive text-badge-destructive-foreground shadow",
        outline: "border border-input text-foreground shadow",
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

function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      <span>{children}</span>
    </div>
  )
}

export { Badge, badgeVariants }
