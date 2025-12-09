import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export type CardVariant = 'default' | 'feature' | 'stats' | 'content' | 'elevated';

export interface CardProps extends Omit<React.ComponentProps<'div'>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'> {
  variant?: CardVariant;
  hover?: boolean;
}

const cardVariants: Record<CardVariant, string> = {
  // Default: Standard card with soft shadow
  default: 'bg-white border border-bg-muted shadow-sm',

  // Feature: For template marketplace items with gradient accent
  feature: 'bg-white border border-bg-muted shadow-md hover:shadow-xl overflow-hidden',

  // Stats: For dashboard metrics with light background
  stats: 'bg-bg-soft border border-bg-muted shadow-sm',

  // Content: For tile preview/editing with clean styling
  content: 'bg-white border border-bg-muted shadow-sm',

  // Elevated: Enhanced shadow for important cards
  elevated: 'bg-white border border-bg-muted shadow-lg'
};

function Card({ className, variant = 'default', hover = false, ...props }: CardProps) {
  if (hover) {
    return (
      <motion.div
        data-slot="card"
        className={cn(
          'flex flex-col gap-6 rounded-xl py-6 transition-all',
          cardVariants[variant],
          className
        )}
        whileHover={{ y: -4, boxShadow: 'var(--shadow-xl)' }}
        transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
        {...props}
      />
    );
  }

  return (
    <div
      data-slot="card"
      className={cn(
        'flex flex-col gap-6 rounded-xl py-6 transition-all',
        cardVariants[variant],
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6',
        'has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
        className
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<'h3'>) {
  return (
    <h3
      data-slot="card-title"
      className={cn('text-xl font-semibold leading-tight text-text-primary', className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="card-description"
      className={cn('text-sm text-text-secondary leading-relaxed', className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn('px-6', className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center gap-3 px-6 [.border-t]:pt-6', className)}
      {...props}
    />
  );
}

// Feature Card specific components
function CardImage({ className, src, alt, ...props }: React.ComponentProps<'div'> & { src?: string; alt?: string }) {
  return (
    <div
      data-slot="card-image"
      className={cn('relative -mx-6 -mt-6 mb-4 aspect-video overflow-hidden', className)}
      {...props}
    >
      {src ? (
        <>
          <img src={src} alt={alt || ''} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </>
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-accent-peach/20 to-accent-lavender/20" />
      )}
    </div>
  );
}

function CardTags({ className, children, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="card-tags" className={cn('flex flex-wrap gap-2', className)} {...props}>
      {children}
    </div>
  );
}

function CardTag({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-gradient-to-r from-accent-peach/20 to-accent-lavender/20',
        'px-3 py-1 text-xs font-medium text-text-primary',
        className
      )}
      {...props}
    />
  );
}

// Stats Card specific components
function CardStat({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-stat"
      className={cn('flex flex-col gap-1', className)}
      {...props}
    />
  );
}

function CardStatLabel({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      className={cn('text-sm font-medium text-text-secondary', className)}
      {...props}
    />
  );
}

function CardStatValue({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      className={cn('text-3xl font-bold text-text-primary font-display', className)}
      {...props}
    />
  );
}

function CardStatChange({ className, positive, ...props }: React.ComponentProps<'p'> & { positive?: boolean }) {
  return (
    <p
      className={cn(
        'text-sm font-medium',
        positive ? 'text-success' : 'text-error',
        className
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  CardImage,
  CardTags,
  CardTag,
  CardStat,
  CardStatLabel,
  CardStatValue,
  CardStatChange
};
