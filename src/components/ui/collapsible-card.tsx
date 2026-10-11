import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { cn } from "@/lib/utils"
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger
} from "./collapsible"

type Props = React.HTMLAttributes<HTMLDivElement> & {
	onOpenChange?(open: boolean): void
	open?: boolean
}

export const CollapsibleCard = React.forwardRef<HTMLDivElement, Props>(
	({ className, ...props }, ref) => (
		<Card className={cn("glass-gradient-border glass-surface border-transparent bg-transparent", className)}>
			<div
				aria-hidden="true"
				className="header-glass__backdrop header-glass__backdrop--surface"
			/>
			<Collapsible ref={ref} {...props} />
		</Card>
	)
)

export const CollapsibleCardHeader = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<CollapsibleTrigger asChild>
		<CardHeader ref={ref} className="data-[state=open]:border-b cursor-pointer">
			<CardTitle {...props} className="flex gap-2"/>
		</CardHeader>
	</CollapsibleTrigger>
))

export const CollapsibleCardContent = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<CollapsibleContent
		ref={ref}
		className="overflow-hidden data-[state=open]:animate-slide-down data-[state=closed]:animate-slide-up pt-2"
	>
		<CardContent {...props} />
	</CollapsibleContent>
))
