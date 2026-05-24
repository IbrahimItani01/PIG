import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium", {
  variants: {
    variant: {
      default: "border-primary/30 bg-primary/15 text-primary-foreground",
      secondary: "border-border bg-secondary text-secondary-foreground",
      success: "border-success/30 bg-success/15 text-success",
      warning: "border-warning/30 bg-warning/15 text-warning",
      danger: "border-destructive/30 bg-destructive/15 text-destructive",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
