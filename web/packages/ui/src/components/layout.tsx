import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '../lib';

export function Card({ className, ...props }: ComponentProps<'section'>) {
  return <section className={cn('rounded-2xl border border-border bg-surface p-5 shadow-sm', className)} {...props} />;
}

export function PageTitle({ className, ...props }: ComponentProps<'h1'>) {
  return <h1 className={cn('text-2xl font-bold text-strong', className)} {...props} />;
}

export function SectionTitle({ className, ...props }: ComponentProps<'h2'>) {
  return <h2 className={cn('text-lg font-semibold', className)} {...props} />;
}

const alertVariants = cva('rounded-xl px-4 py-3 text-sm', {
  variants: {
    tone: {
      info: 'bg-soft text-strong',
      error: 'border border-danger text-danger',
      success: 'border border-success text-success',
    },
  },
  defaultVariants: { tone: 'info' },
});

export function Alert({ className, tone, ...props }: ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return <div role={tone === 'error' ? 'alert' : 'status'} className={cn(alertVariants({ tone }), className)} {...props} />;
}
