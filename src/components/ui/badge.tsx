import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "glass-gradient-border glass-surface inline-flex items-center rounded-md border border-transparent bg-transparent px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary/50 text-foreground shadow hover:bg-primary/80",
        secondary:
          "bg-secondary/50 text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "bg-destructive/50 text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
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
      <span aria-hidden="true" className="header-glass__backdrop" />
      <span>{children}</span>
    </div>
  )
}

export { Badge, badgeVariants }
