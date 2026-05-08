import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { rpc } from "@/lib/hono-rpc-client";

const statusVariant = (status: string): "default" | "secondary" | "outline" => {
  switch (status) {
    case "published": {
      return "default";
    }
    case "draft": {
      return "secondary";
    }
    default: {
      return "outline";
    }
  }
};

interface PostTableProps {
  posts: {
    content: string;
    createdAt: string;
    id: string;
    status: "draft" | "published";
    title: string;
    updatedAt: string;
  }[];
}

export function PostTable({ posts }: PostTableProps) {
  const deleteMutation = rpc.api.v1.post[":postId"].$delete.useMutation({
    invalidate: [rpc.api.v1.post.$get.getQueryKey()],
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success("Post deleted");
    }
  });

  function handleDelete(postId: string) {
    deleteMutation.mutate({ param: { postId } });
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.length === 0 && (
            <TableRow>
              <TableCell
                className="h-24 text-center text-muted-foreground"
                colSpan={5}
              >
                No posts yet.
                <Link
                  className="ml-1 text-primary underline-offset-4 hover:underline"
                  to="/post/new"
                >
                  Create your first post
                </Link>
              </TableCell>
            </TableRow>
          )}
          {posts.map((postItem) => (
            <TableRow key={postItem.id}>
              <TableCell className="font-medium">
                <Link
                  className="underline-offset-4 hover:underline"
                  to="/post/$postId"
                  params={{ postId: postItem.id }}
                >
                  {postItem.title || "(untitled)"}
                </Link>
              </TableCell>
              <TableCell>
                <Badge variant={statusVariant(postItem.status)}>
                  {postItem.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(postItem.createdAt), "MMM d, yyyy")}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(postItem.updatedAt), "MMM d, yyyy")}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    asChild
                    size="icon"
                    variant="ghost"
                  >
                    <Link
                      to="/post/$postId"
                      params={{ postId: postItem.id }}
                    >
                      <PencilIcon />
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                      >
                        <Trash2Icon className="text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete post</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "
                          {postItem.title || "untitled"}" ? This action cannot
                          be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          disabled={deleteMutation.isPending}
                          onClick={() => handleDelete(postItem.id)}
                        >
                          {deleteMutation.isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
