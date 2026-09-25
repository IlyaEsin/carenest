import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '../lib';

// Every size keeps a 44px touch target (spec section 6).
const buttonVariants = cva(
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-base font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-accent text-accent-foreground hover:opacity-90',
        secondary: 'border border-border bg-surface text-foreground hover:bg-muted',
        ghost: 'text-foreground hover:bg-muted',
        danger: 'bg-danger text-background hover:opacity-90',
      },
      width: {
        auto: '',
        full: 'w-full',
      },
    },
    defaultVariants: { variant: 'primary', width: 'auto' },
  },
);

type ButtonProps = ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({ className, variant, width, asChild = false, type = 'button', ...props }: ButtonProps) {
  const Component = asChild ? Slot.Root : 'button';
  return <Component type={asChild ? undefined : type} className={cn(buttonVariants({ variant, width }), className)} {...props} />;
}
