import { Label as LabelPrimitive } from 'radix-ui';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '../lib';

const control =
  'min-h-11 w-full rounded-xl border border-border bg-surface px-4 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-accent aria-invalid:border-danger';

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cn(control, className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<'select'>) {
  return <select className={cn(control, className)} {...props} />;
}

export function Label({ className, ...props }: ComponentProps<typeof LabelPrimitive.Root>) {
  return <LabelPrimitive.Root className={cn('text-sm font-semibold', className)} {...props} />;
}

type FieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
};

// The control inside must carry the same id plus aria-invalid and aria-describedby from fieldAria().
export function Field({ id, label, hint, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function fieldAria(id: string, options: { error?: string; hint?: string }) {
  const describedBy = options.error ? `${id}-error` : options.hint ? `${id}-hint` : undefined;
  return { id, 'aria-invalid': options.error ? true : undefined, 'aria-describedby': describedBy };
}
