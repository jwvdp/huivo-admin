import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CircleAlert } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/better-auth-client";
import { PageTitle } from "@/routes/_protected/components/page-title";

export const Route = createFileRoute("/debug/")({
  component: RouteComponent
});

async function loginRequest() {
  const res = await authClient.signIn.email({
    email: "test@test.com",
    password: "test"
  });
  return res.data;
}

function RouteComponent() {
  const { mutate, data, error, isPending, isSuccess, reset } = useMutation({
    mutationFn: loginRequest
  });

  return (
    <div className="mx-auto max-w-lg space-y-6 p-6">
      <PageTitle
        title="Auth Debug"
        subtitle="Test authentication endpoints"
      />
      <Card>
        <CardHeader>
          <CardTitle>Auth 调试</CardTitle>
          <CardDescription>
            向{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              POST /api/v1/auth/login
            </code>{" "}
            发送固定账号并展示响应。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Button
              disabled={isPending}
              onClick={() => mutate()}
            >
              {isPending && <Spinner className="mr-2" />}
              发起登录
            </Button>
            {(isSuccess || error) && (
              <Button
                onClick={() => reset()}
                size="sm"
                variant="outline"
              >
                清除结果
              </Button>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <CircleAlert />
              <AlertTitle>请求失败</AlertTitle>
              <AlertDescription>
                <pre className="mt-2 max-h-48 overflow-auto rounded-md bg-background/50 p-3 font-mono text-xs whitespace-pre-wrap">
                  {error.message}
                </pre>
              </AlertDescription>
            </Alert>
          )}

          {isSuccess && data !== undefined && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                响应 JSON
              </p>
              <pre className="max-h-64 overflow-auto rounded-lg border bg-muted/40 p-4 font-mono text-sm">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
