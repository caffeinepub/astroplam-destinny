import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import type { BlogPost } from "../hooks/useQueries";
import { useCreatePost, useUpdatePost } from "../hooks/useQueries";

interface BlogPostEditorProps {
  post: BlogPost | null;
  onClose: () => void;
}

export default function BlogPostEditor({ post, onClose }: BlogPostEditorProps) {
  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [author, setAuthor] = useState(post?.author || "");

  const createMutation = useCreatePost();
  const updateMutation = useUpdatePost();
  const isEditing = !!post;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required.");
      return;
    }
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: post.id,
          title: title.trim(),
          content: content.trim(),
          author: author.trim() || post.author || "Admin",
        });
        toast.success("Post updated successfully");
      } else {
        await createMutation.mutateAsync({
          title: title.trim(),
          content: content.trim(),
          author: author.trim() || "Admin",
        });
        toast.success("Post created successfully");
      }
      onClose();
    } catch {
      toast.error("Failed to save post. Please try again.");
    }
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className="max-w-2xl bg-cream-bg border-gold/20"
        data-ocid="blog_editor.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-charcoal">
            {isEditing ? "Edit Post" : "Create New Post"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label
              htmlFor="post-title"
              className="text-sm text-charcoal/70 mb-1"
            >
              Title *
            </Label>
            <Input
              id="post-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title..."
              required
              className="border-gold/20 focus:border-gold/50"
              data-ocid="blog_editor.title.input"
            />
          </div>
          <div>
            <Label
              htmlFor="post-author"
              className="text-sm text-charcoal/70 mb-1"
            >
              Author
            </Label>
            <Input
              id="post-author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Author name..."
              className="border-gold/20 focus:border-gold/50"
              data-ocid="blog_editor.author.input"
            />
          </div>
          <div>
            <Label
              htmlFor="post-content"
              className="text-sm text-charcoal/70 mb-1"
            >
              Content *
            </Label>
            <Textarea
              id="post-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post content here..."
              rows={10}
              required
              className="border-gold/20 focus:border-gold/50 resize-none"
              data-ocid="blog_editor.content.textarea"
            />
          </div>
          <DialogFooter className="gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline-gold text-sm px-4 py-2"
              data-ocid="blog_editor.cancel.button"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="btn-gold flex items-center gap-2 text-sm px-4 py-2"
              data-ocid="blog_editor.save.button"
            >
              {isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              {isPending
                ? "Saving..."
                : isEditing
                  ? "Update Post"
                  : "Create Post"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
