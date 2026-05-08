import type { ReactNode } from "react";

import { Children } from "react";

interface PageTitleProps {
  title: string | ReactNode;
  subtitle: string | React.ReactNode;
  children?: React.ReactNode;
}

export function PageTitle({ title, subtitle, children }: PageTitleProps) {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h1 className="text-xl font-semibold">{title}</h1>
          <h2 className="text-sm text-muted-foreground">{subtitle}</h2>
        </div>
        {children && (
          <div className="hidden w-fit shrink-0 flex-row items-end gap-2 sm:flex">
            {children}
          </div>
        )}
      </div>
      {children && (
        <div className="fixed right-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 z-40 border-t border-border bg-background px-6 py-3 sm:hidden">
          <div
            className="mobile-floating-actions mx-auto grid max-w-screen-sm gap-3"
            style={{
              gridTemplateColumns: `repeat(${Children.count(children)}, 1fr)`
            }}
          >
            {children}
          </div>
        </div>
      )}
    </>
  );
}

export function SectionWithTitle({
  title,
  children,
  action
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold">{title}</p>
        {action}
      </div>
      {children}
    </section>
  );
}
