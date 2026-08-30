import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide",
  {
    variants: {
      variant: {
        quiet: "border-border bg-surface-2 text-muted",
        accent: "border-transparent bg-accent text-accent-fg",
        live: "border-border bg-surface text-fg",
        rail: "border-border bg-bg text-fg",
      },
    },
    defaultVariants: { variant: "quiet" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
