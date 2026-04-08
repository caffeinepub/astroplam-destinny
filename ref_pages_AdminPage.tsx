import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, LogOut, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCheckAdmin,
  useCreatePost,
  useDeletePost,
  useGetAllPostsAdmin,
  useGetVisitorQueries,
} from "../hooks/useQueries";

function formatDate(raw: unknown): string {
  if (!raw) return "";
  try {
    const ms = typeof raw === "bigint" ? Number(raw) / 1_000_000 : Number(raw);
    return new Date(ms).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function OverviewTab() {
  const { data: queries } = useGetVisitorQueries();
  const { data: posts } = useGetAllPostsAdmin();
  const { actor } = useActor();
  const [noticeCount, setNoticeCount] = useState<number | null>(null);

  // Fetch notice count
  if (actor && noticeCount === null) {
    (actor as any)
      .noticeList?.()
      .then((list: unknown[]) => setNoticeCount(list.length))
      .catch(() => setNoticeCount(0));
  }

  const stats = [
    { label: "Visitor Queries", value: queries?.length ?? 0, icon: "📬" },
    { label: "Blog Posts", value: posts?.length ?? 0, icon: "📝" },
    { label: "Notices", value: noticeCount ?? 0, icon: "📣" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((s) => (
        <Card
          key={s.label}
          className="border-gold/30 bg-amber-50/50"
          data-ocid="admin.card"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-charcoal/60">
              {s.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl">{s.icon}</div>
            <div className="text-3xl font-bold text-gold-dark mt-1">
              {s.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function QueriesTab() {
  const { data: queries, isLoading } = useGetVisitorQueries();

  if (isLoading) {
    return (
      <div
        className="py-8 text-center text-charcoal/50"
        data-ocid="admin.loading_state"
      >
        Loading queries...
      </div>
    );
  }

  if (!queries || queries.length === 0) {
    return (
      <div className="py-12 text-center" data-ocid="admin.empty_state">
        <p className="text-4xl mb-2">📬</p>
        <p className="text-charcoal/50">No visitor queries yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gold/20">
            <th className="text-left py-2 px-3 text-gold-dark font-semibold">
              Name
            </th>
            <th className="text-left py-2 px-3 text-gold-dark font-semibold">
              Contact
            </th>
            <th className="text-left py-2 px-3 text-gold-dark font-semibold">
              Message
            </th>
            <th className="text-left py-2 px-3 text-gold-dark font-semibold">
              Date
            </th>
          </tr>
        </thead>
        <tbody>
          {(queries as any[]).map((q, i) => (
            <tr
              key={q.id ?? i}
              className="border-b border-amber-100 hover:bg-amber-50/40 transition-colors"
              data-ocid={`admin.row.${i + 1}`}
            >
              <td className="py-2 px-3 text-charcoal">{q.name ?? "-"}</td>
              <td className="py-2 px-3 text-charcoal/70">
                {q.contact ?? q.email ?? "-"}
              </td>
              <td className="py-2 px-3 text-charcoal/70 max-w-xs truncate">
                {q.message ?? "-"}
              </td>
              <td className="py-2 px-3 text-charcoal/50 whitespace-nowrap">
                {formatDate(q.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BlogTab() {
  const { data: posts, isLoading } = useGetAllPostsAdmin();
  const createPost = useCreatePost();
  const deletePost = useDeletePost();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");

  async function handleCreate() {
    if (!title || !content || !author) {
      toast.error("Fill all fields");
      return;
    }
    try {
      await createPost.mutateAsync({ title, content, author });
      toast.success("Post created");
      setOpen(false);
      setTitle("");
      setContent("");
      setAuthor("");
    } catch {
      toast.error("Failed to create post");
    }
  }

  async function handleDelete(id: string) {
    try {
      await deletePost.mutateAsync(id);
      toast.success("Post deleted");
    } catch {
      toast.error("Failed to delete post");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              data-ocid="admin.open_modal_button"
              className="font-semibold"
              style={{ background: "#d4af37", color: "#fff" }}
            >
              <Plus className="w-4 h-4 mr-1" /> New Post
            </Button>
          </DialogTrigger>
          <DialogContent data-ocid="admin.dialog">
            <DialogHeader>
              <DialogTitle>New Blog Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Title</Label>
                <Input
                  data-ocid="admin.input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Post title"
                />
              </div>
              <div>
                <Label>Author</Label>
                <Input
                  data-ocid="admin.input"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Author name"
                />
              </div>
              <div>
                <Label>Content</Label>
                <Textarea
                  data-ocid="admin.textarea"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Post content"
                  rows={5}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  data-ocid="admin.cancel_button"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  data-ocid="admin.submit_button"
                  onClick={handleCreate}
                  disabled={createPost.isPending}
                  style={{ background: "#d4af37", color: "#fff" }}
                >
                  {createPost.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Publish"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div
          className="py-6 text-center text-charcoal/50"
          data-ocid="admin.loading_state"
        >
          Loading posts...
        </div>
      ) : !posts || posts.length === 0 ? (
        <div className="py-12 text-center" data-ocid="admin.empty_state">
          <p className="text-4xl mb-2">📝</p>
          <p className="text-charcoal/50">No blog posts yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((post, i) => (
            <div
              key={post.id}
              className="flex items-center justify-between rounded-xl border border-gold/20 bg-amber-50/30 px-4 py-3 gap-3"
              data-ocid={`admin.item.${i + 1}`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-charcoal truncate">
                  {post.title}
                </p>
                <p className="text-xs text-charcoal/50">
                  {post.author} &middot; {formatDate((post as any).createdAt)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                data-ocid={`admin.delete_button.${i + 1}`}
                onClick={() => handleDelete(post.id)}
                disabled={deletePost.isPending}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NoticesTab() {
  const { actor } = useActor();
  const [notices, setNotices] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [creating, setCreating] = useState(false);
  const [open, setOpen] = useState(false);

  function loadNotices() {
    if (!actor) return;
    setLoading(true);
    (actor as any)
      .noticeList?.()
      .then((list: any[]) => {
        setNotices(list);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }

  if (notices === null && actor) loadNotices();

  async function handleCreate() {
    if (!title || !message) {
      toast.error("Fill all fields");
      return;
    }
    if (!actor) return;
    setCreating(true);
    try {
      await (actor as any).noticeCreate("", "", title, message);
      toast.success("Notice created");
      setOpen(false);
      setTitle("");
      setMessage("");
      loadNotices();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to create notice");
    }
    setCreating(false);
  }

  async function handleDelete(id: string) {
    if (!actor) return;
    try {
      await (actor as any).noticeDelete("", "", id);
      toast.success("Notice deleted");
      loadNotices();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to delete notice");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              data-ocid="admin.open_modal_button"
              style={{ background: "#d4af37", color: "#fff" }}
              className="font-semibold"
            >
              <Plus className="w-4 h-4 mr-1" /> New Notice
            </Button>
          </DialogTrigger>
          <DialogContent data-ocid="admin.dialog">
            <DialogHeader>
              <DialogTitle>New Notice</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Title</Label>
                <Input
                  data-ocid="admin.input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Notice title"
                />
              </div>
              <div>
                <Label>Message</Label>
                <Textarea
                  data-ocid="admin.textarea"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Notice message"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  data-ocid="admin.cancel_button"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  data-ocid="admin.submit_button"
                  onClick={handleCreate}
                  disabled={creating}
                  style={{ background: "#d4af37", color: "#fff" }}
                >
                  {creating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Publish"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div
          className="py-6 text-center text-charcoal/50"
          data-ocid="admin.loading_state"
        >
          Loading notices...
        </div>
      ) : !notices || notices.length === 0 ? (
        <div className="py-12 text-center" data-ocid="admin.empty_state">
          <p className="text-4xl mb-2">📣</p>
          <p className="text-charcoal/50">No notices yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notices.map((n, i) => (
            <div
              key={n.id ?? i}
              className="flex items-center justify-between rounded-xl border border-gold/20 bg-amber-50/30 px-4 py-3 gap-3"
              data-ocid={`admin.item.${i + 1}`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-charcoal">{n.title}</p>
                <p className="text-xs text-charcoal/60 mt-0.5">{n.message}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                data-ocid={`admin.delete_button.${i + 1}`}
                onClick={() => handleDelete(n.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const navigate = useNavigate();
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const { data: isAdmin, isLoading: checkingAdmin } = useCheckAdmin();

  if (!identity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50/30">
        <div className="rounded-2xl border border-gold/30 bg-white shadow-sm p-10 max-w-sm w-full text-center space-y-5">
          <div className="text-5xl">✨</div>
          <h1 className="text-2xl font-bold font-serif text-gold-dark">
            Admin Dashboard
          </h1>
          <p className="text-sm text-charcoal/60">
            Sign in with Internet Identity to access the admin panel.
          </p>
          <Button
            data-ocid="admin.primary_button"
            onClick={() => login()}
            disabled={loginStatus === "logging-in"}
            className="w-full font-semibold"
            style={{ background: "#d4af37", color: "#fff" }}
          >
            {loginStatus === "logging-in" ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Sign In
          </Button>
          <Button
            variant="ghost"
            data-ocid="admin.link"
            onClick={() => navigate({ to: "/" })}
            className="w-full text-charcoal/50"
          >
            ← Back to Home
          </Button>
        </div>
      </div>
    );
  }

  if (checkingAdmin) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-amber-50/30"
        data-ocid="admin.loading_state"
      >
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50/30">
        <div className="text-center space-y-4" data-ocid="admin.error_state">
          <p className="text-4xl">🔒</p>
          <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
          <p className="text-sm text-charcoal/60">
            You do not have admin permissions.
          </p>
          <Button
            variant="outline"
            onClick={() => navigate({ to: "/" })}
            data-ocid="admin.link"
          >
            ← Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50/30">
      {/* Header */}
      <header className="bg-white border-b border-gold/20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✨</span>
          <h1 className="text-xl font-bold font-serif text-gold-dark">
            Admin Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-charcoal/50 hidden sm:block">
            {identity.getPrincipal().toString().slice(0, 12)}…
          </span>
          <Button
            variant="outline"
            size="sm"
            data-ocid="admin.secondary_button"
            onClick={() => navigate({ to: "/" })}
            className="text-xs"
          >
            ← Home
          </Button>
          <Button
            size="sm"
            data-ocid="admin.toggle"
            onClick={() => clear()}
            className="text-xs"
            style={{
              background: "#f5e9c4",
              color: "#7a5c00",
              border: "1px solid #d4af37",
            }}
          >
            <LogOut className="w-3.5 h-3.5 mr-1" /> Logout
          </Button>
        </div>
      </header>

      {/* Dashboard content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Tabs defaultValue="overview" data-ocid="admin.panel">
          <TabsList className="mb-6 bg-amber-100/60">
            <TabsTrigger value="overview" data-ocid="admin.tab">
              Overview
            </TabsTrigger>
            <TabsTrigger value="queries" data-ocid="admin.tab">
              Visitor Queries
            </TabsTrigger>
            <TabsTrigger value="blog" data-ocid="admin.tab">
              Blog Posts
            </TabsTrigger>
            <TabsTrigger value="notices" data-ocid="admin.tab">
              Notices
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>

          <TabsContent value="queries">
            <QueriesTab />
          </TabsContent>

          <TabsContent value="blog">
            <BlogTab />
          </TabsContent>

          <TabsContent value="notices">
            <NoticesTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
