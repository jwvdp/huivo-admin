import { SiTelegram } from "@icons-pack/react-simple-icons";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/better-auth-client";
import { queryClient } from "@/lib/hono-rpc-client";
import { getSession, sessionQueryKey } from "@/lib/session";

export const Route = createFileRoute("/auth/register")({
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
    mutationFn: ({
      email,
      password,
      name
    }: {
      email: string;
      password: string;
      name: string;
    }) => authClient.signUp.email({ email, name, password }),
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "注册失败，请稍后重试"
      );
    },
    onSuccess: ({ data, error }) => {
      if (error) {
        toast.error(error.message);
        return;
      }
      if (!data) {
        toast.error("注册失败，请稍后重试");
        return;
      }
      toast.success("注册成功");
      queryClient.setQueryData(sessionQueryKey, { data, error: null });
      navigate({ to: "/dashboard" });
    }
  });

  const registerForm = useForm({
    defaultValues: {
      email: `${Math.random().toString(36).slice(2, 15)}@1.cc`,
      name: Math.random().toString(36).slice(2, 15),
      password: "12345687"
    },
    onSubmit: ({ value }) => {
      mutate(value);
    },
    validators: {
      onSubmit: z.object({
        email: z.email(),
        name: z.string(),
        password: z.string()
      })
    }
  });
  return (
    <div className="mx-auto flex h-screen flex-col items-center justify-center p-6">
      <div className="flex w-full max-w-md flex-col gap-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">注册团美</CardTitle>
            <CardDescription>通过社交账号注册</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              id="register-form"
              onSubmit={(e) => {
                e.preventDefault();
                registerForm.handleSubmit();
              }}
            >
              <FieldGroup>
                <Field>
                  <Button
                    type="button"
                    variant="outline"
                  >
                    <SiTelegram />
                    使用 Telegram 登录
                  </Button>
                </Field>
                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                  或者使用邮箱登录
                </FieldSeparator>
                <registerForm.Field name="email">
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
                </registerForm.Field>

                <registerForm.Field name="password">
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
                </registerForm.Field>
                <Field>
                  <Button
                    className="main"
                    type="submit"
                  >
                    注册
                  </Button>
                  <FieldDescription className="text-center">
                    已有账号？ <a href="/auth/login">登录</a>
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
