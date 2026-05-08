import { TanStackDevtools } from "@tanstack/react-devtools";
import { FormDevtoolsPanel } from "@tanstack/react-form-devtools";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { ThemeProvider } from "next-themes";

import "../styles.css";
import { Toaster } from "sonner";

import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "@/lib/hono-rpc-client";

export const Route = createRootRoute({
  component: RootComponent,
  errorComponent: RootErrorComponent
});

function RootComponent() {
  return (
    <ThemeProvider
      attribute="class"
      disableTransitionOnChange
      enableSystem
      storageKey="go-theme"
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={0}>
          <Outlet />
        </TooltipProvider>
        <Toaster />
        <TanStackDevtools
          config={{
            position: "bottom-right"
          }}
          plugins={[
            {
              name: "TanStack Query",
              render: <ReactQueryDevtoolsPanel />
            },
            {
              name: "TanStack Router",
              render: <TanStackRouterDevtoolsPanel />
            },
            {
              name: "TanStack Form",
              render: <FormDevtoolsPanel />
            }
          ]}
        />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

function RootErrorComponent({ error }: { error: unknown }) {
  let message = "Unknown error";
  if (isRouterStatusError(error)) {
    message = `${error.status} ${error.statusText}`;
  } else if (error instanceof Error) {
    ({ message } = error);
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function isRouterStatusError(
  value: unknown
): value is { status: number; statusText: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "status" in value &&
    "statusText" in value &&
    typeof value.status === "number" &&
    typeof value.statusText === "string"
  );
}
