import * as React from "react"
import { cn } from "@/lib/utils"

const CalculatorCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "bg-gradient-card border shadow-card rounded-xl p-6 transition-smooth hover:shadow-float",
      className
    )}
    {...props}
  />
))
CalculatorCard.displayName = "CalculatorCard"

const CalculatorCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 mb-4", className)}
    {...props}
  />
))
CalculatorCardHeader.displayName = "CalculatorCardHeader"

const CalculatorCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight text-foreground",
      className
    )}
    {...props}
  />
))
CalculatorCardTitle.displayName = "CalculatorCardTitle"

const CalculatorCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CalculatorCardDescription.displayName = "CalculatorCardDescription"

const CalculatorCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-4", className)} {...props} />
))
CalculatorCardContent.displayName = "CalculatorCardContent"

export {
  CalculatorCard,
  CalculatorCardHeader,
  CalculatorCardTitle,
  CalculatorCardDescription,
  CalculatorCardContent,
}