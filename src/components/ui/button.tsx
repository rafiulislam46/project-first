import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-2xl text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 disabled:opacity-60 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default:
          "btn-gradient",
        outline:
          "border bg-transparent text-text-hi hover:bg-white/5 focus-visible:ring-accent-1/40",
        ghost:
          "text-text-hi/80 hover:text-text-hi hover:bg-white/5 focus-visible:ring-accent-1/40",
      },
      size: {
        default: "h-10 px-5 py-2.5",
        sm: "h-9 px-4",
        lg: "h-11 px-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };