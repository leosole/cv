import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible";

export const CollapsibleCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <Card>
        <Collapsible ref={ref} {...props} />
    </Card>
))

export const CollapsibleCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <CollapsibleTrigger>
        <CardHeader ref={ref}>
            <CardTitle {...props}/>
        </CardHeader>
    </CollapsibleTrigger>
))

export const CollapsibleCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <CollapsibleContent ref={ref}>
        <CardContent {...props}/>
    </CollapsibleContent>
))