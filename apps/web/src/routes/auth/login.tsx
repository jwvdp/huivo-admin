import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  CardContent,
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/better-auth-client";
import { queryClient } from "@/lib/hono-rpc-client";
import { getSession, sessionQueryKey } from "@/lib/session";

export const Route = createFileRoute("/auth/login")({
  beforeLoad: async () => {
    const { data: session } = await getSession();
    if (session?.user) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: RouteComponent
});

function RouteComponent() {
  const navigate = useNavigate();

  const { mutate } = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authClient.signIn.email({ email, password }),
    onSuccess: ({ data, error }) => {
      if (error) {
        toast.error(error.message);
      }
      if (data) {
        queryClient.setQueryData(sessionQueryKey, { data, error: null });
        navigate({ to: "/dashboard" });
      }
    }
  });

  const loginForm = useForm({
    defaultValues: {
      email: "1@1.cc",
      password: "12345687"
    },
    onSubmit: ({ value }) => {
      mutate(value);
    },
    validators: {
      onSubmit: z.object({
        email: z.email(),
        password: z.string()
      })
    }
  });

  return (
    <div className="mx-auto flex h-screen flex-col items-center justify-center p-6">
      <div className="flex w-full max-w-md flex-col gap-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">登录</CardTitle>
            <CardDescription>通过社交账号登录</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              id="login-form"
              onSubmit={(e) => {
                e.preventDefault();
                loginForm.handleSubmit();
              }}
            >
              <FieldGroup>
                <loginForm.Field name="email">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor="email">邮箱</FieldLabel>
                      <Input
                        id={field.name}
                        onChange={(e) => field.handleChange(e.target.value)}
                        required
                        type="email"
                        value={field.state.value}
                      />
                    </Field>
                  )}
                </loginForm.Field>

                <loginForm.Field name="password">
                  {(field) => (
                    <>
                      <Field>
                        <FieldLabel htmlFor="password">密码</FieldLabel>
                        <Input
                          id={field.name}
                          onChange={(e) => field.handleChange(e.target.value)}
                          required
                          type="password"
                          value={field.state.value}
                        />
                      </Field>
                    </>
                  )}
                </loginForm.Field>
                <Field>
                  <Button
                    className="main"
                    type="submit"
                  >
                    登录
                  </Button>
                  <FieldDescription className="text-center">
                    没有账号？ <a href="/auth/register">注册</a>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
        <FieldDescription className="px-6 text-center">
          请务必查看 <a href="/privacy">平台政策</a> 了解更多信息。
        </FieldDescription>
      </div>
    </div>
  );
}
