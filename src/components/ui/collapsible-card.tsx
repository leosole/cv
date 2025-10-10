import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible";

type Props = React.HTMLAttributes<HTMLDivElement> & { onOpenChange?(open: boolean): void }

export const CollapsibleCard = React.forwardRef<
  HTMLDivElement,
  Props
>(({ className, ...props }, ref) => (
    <Card>
        <Collapsible ref={ref} {...props} />
    </Card>
))

export const CollapsibleCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <CollapsibleTrigger asChild>
        <CardHeader ref={ref} className="data-[state=open]:border-b cursor-pointer">
            <CardTitle {...props}/>
        </CardHeader>
    </CollapsibleTrigger>
))

export const CollapsibleCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <CollapsibleContent ref={ref} className="overflow-hidden data-[state=open]:animate-slide-down data-[state=closed]:animate-slide-up pt-2">
        <CardContent {...props}/>
    </CollapsibleContent>
))