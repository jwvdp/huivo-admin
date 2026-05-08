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

const updateSchema = z.object({
  content: z.string(),
  status: z.enum(["draft", "published"]),
  title: z.string().min(1).max(200)
});

interface EditPostFormProps {
  postId: string;
  postItem: {
    content: string;
    status: "draft" | "published";
    title: string;
  };
}

export function EditPostForm({ postId, postItem }: EditPostFormProps) {
  const router = useRouter();

  const updateMutation = rpc.api.v1.post[":postId"].$patch.useMutation({
    invalidate: [
      rpc.api.v1.post[":postId"].$get.getQueryKey({ param: { postId } }),
      rpc.api.v1.post.$get.getQueryKey()
    ],
    onSuccess: () => {
      toast.success("Post updated");
      router.navigate({ to: "/post" });
    }
  });

  const editForm = useForm({
    defaultValues: {
      content: postItem.content,
      status: postItem.status,
      title: postItem.title
    },
    onSubmit: ({ value }) => {
      updateMutation.mutate({ json: value, param: { postId } });
    },
    validators: { onSubmit: updateSchema }
  });

  return (
    <div className="mx-auto w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          editForm.handleSubmit();
        }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Edit Post</CardTitle>
            <CardDescription>Update your blog post</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <editForm.Field name="title">
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
            </editForm.Field>

            <editForm.Field name="content">
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
            </editForm.Field>

            <editForm.Field name="status">
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
            </editForm.Field>
          </CardContent>
          <CardFooter className="justify-between">
            <Button
              disabled={updateMutation.isPending}
              type="button"
              variant="outline"
              onClick={() => router.history.back()}
            >
              Cancel
            </Button>
            <Button
              disabled={updateMutation.isPending}
              type="submit"
            >
              {updateMutation.isPending ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                "Save"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
