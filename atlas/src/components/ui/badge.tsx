import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'outline' | 'success' | 'warning' | 'danger' | 'auri' | 'muted';

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-primary/10 text-primary border-primary/20',
  outline: 'bg-transparent text-ink border-line',
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  danger: 'bg-danger/10 text-danger border-danger/20',
  auri: 'bg-auri/10 text-auri border-auri/20',
  muted: 'bg-canvas-alt text-muted border-line',
};

export function Badge({ variant = 'default', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
