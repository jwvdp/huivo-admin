import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { rpc } from "@/lib/hono-rpc-client";

const createSchema = z.object({
  content: z.string(),
  status: z.enum(["draft", "published"]),
  title: z.string().min(1).max(200)
});

export function CreatePostForm() {
  const router = useRouter();

  const createMutation = rpc.api.v1.post.$post.useMutation({
    invalidate: () => [rpc.api.v1.post.$get.getQueryKey()],
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: (data) => {
      toast.success("Post created");
      router.navigate({
        params: { postId: data.id },
        to: "/post/$postId"
      });
    }
  });

  const createForm = useForm({
    defaultValues: {
      content: "123123",
      status: "draft" as "draft" | "published",
      title: "123123"
    },
    onSubmit: ({ value }) => {
      createMutation.mutate({ json: value });
    },
    validators: { onSubmit: createSchema }
  });

  return (
    <div className="mx-auto w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createForm.handleSubmit();
        }}
      >
        <Card>
          <CardHeader>
            <CardTitle>New Post</CardTitle>
            <CardDescription>Create a new blog post</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <createForm.Field name="title">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                  <Input
                    id={field.name}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Post title"
                    value={field.state.value}
                  />
                </Field>
              )}
            </createForm.Field>

            <createForm.Field name="content">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Content</FieldLabel>
                  <Textarea
                    id={field.name}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Write your post content here..."
                    rows={12}
                    value={field.state.value}
                  />
                </Field>
              )}
            </createForm.Field>

            <createForm.Field name="status">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Status</FieldLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={(value: "draft" | "published") =>
                      field.handleChange(value)
                    }
                  >
                    <SelectTrigger id={field.name}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            </createForm.Field>
          </CardContent>
          <CardFooter className="justify-between">
            <Button
              disabled={createMutation.isPending}
              type="button"
              variant="outline"
              onClick={() => router.history.back()}
            >
              Cancel
            </Button>
            <Button disabled={createMutation.isPending}>
              {createMutation.isPending && (
                <Loader2Icon className="animate-spin" />
              )}
              Create Post
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
