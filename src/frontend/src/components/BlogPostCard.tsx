import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Edit2,
  Eye,
  EyeOff,
  Loader2,
  Trash2,
  User,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import type { BlogPost } from "../hooks/useQueries";
import { useDeletePost, usePublishPost } from "../hooks/useQueries";

interface BlogPostCardProps {
  post: BlogPost;
  isAdmin: boolean;
  onEdit: (post: BlogPost) => void;
}

export default function BlogPostCard({
  post,
  isAdmin,
  onEdit,
}: BlogPostCardProps) {
  const [expanded, setExpanded] = useState(false);
  const deleteMutation = useDeletePost();
  const publishMutation = usePublishPost();

  const formatDate = (time: bigint) => {
    const ms = Number(time / BigInt(1_000_000));
    return new Date(ms).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await deleteMutation.mutateAsync(post.id);
      toast.success("Post deleted successfully");
    } catch {
      toast.error("Failed to delete post");
    }
  };

  const handleTogglePublish = async () => {
    try {
      await publishMutation.mutateAsync(post.id);
      toast.success(post.published ? "Post unpublished" : "Post published");
    } catch {
      toast.error("Failed to update post status");
    }
  };

  const truncated = post.content.length > 200 && !expanded;
  const displayContent = truncated
    ? `${post.content.slice(0, 200)}...`
    : post.content;

  return (
    <div className="card-hover rounded-xl border border-lavender-dark/30 bg-lavender/40 p-6 flex flex-col">
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-serif text-lg font-semibold text-charcoal leading-tight flex-1">
          {post.title}
        </h3>
        {isAdmin && (
          <Badge
            variant={post.published ? "default" : "secondary"}
            className={`text-xs shrink-0 ${
              post.published
                ? "bg-sage/20 text-sage-dark border-sage/30"
                : "bg-charcoal/10 text-charcoal/50"
            }`}
          >
            {post.published ? "Published" : "Draft"}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-3 text-xs text-charcoal/50 mb-3">
        <span className="flex items-center gap-1">
          <User size={11} />
          {post.author}
        </span>
        <span className="flex items-center gap-1">
          <Calendar size={11} />
          {formatDate(post.createdAt)}
        </span>
      </div>

      <p className="text-sm text-charcoal/70 leading-relaxed flex-1 whitespace-pre-line">
        {displayContent}
      </p>
      {post.content.length > 200 && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-gold-dark hover:text-gold mt-2 font-medium transition-colors"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}

      {isAdmin && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-lavender-dark/20">
          <button
            type="button"
            onClick={() => onEdit(post)}
            className="flex items-center gap-1 text-xs text-charcoal/60 hover:text-gold-dark transition-colors px-2 py-1 rounded hover:bg-gold/10"
          >
            <Edit2 size={12} />
            Edit
          </button>
          <button
            type="button"
            onClick={handleTogglePublish}
            disabled={publishMutation.isPending}
            className="flex items-center gap-1 text-xs text-charcoal/60 hover:text-sage-dark transition-colors px-2 py-1 rounded hover:bg-sage/10"
          >
            {publishMutation.isPending ? (
              <Loader2 size={12} className="animate-spin" />
            ) : post.published ? (
              <EyeOff size={12} />
            ) : (
              <Eye size={12} />
            )}
            {post.published ? "Unpublish" : "Publish"}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="flex items-center gap-1 text-xs text-charcoal/60 hover:text-destructive transition-colors px-2 py-1 rounded hover:bg-destructive/10 ml-auto"
          >
            {deleteMutation.isPending ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Trash2 size={12} />
            )}
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
