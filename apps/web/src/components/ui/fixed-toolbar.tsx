// @ts-nocheck
'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

import { Toolbar } from '@/components/ui/toolbar';

export function FixedToolbar({
  className,
  ...props
}: React.ComponentProps<typeof Toolbar>) {
  return (
    <Toolbar
      className={cn(
        'sticky top-0 z-30 flex-wrap gap-1 border-b border-border bg-background/95 p-1.5 backdrop-blur supports-backdrop-filter:bg-background/80',
        className
      )}
      {...props}
    />
  );
}
