import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Clock,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useCreateUser,
  useDeleteUser,
  useGetFreeEmailClaims,
  useListUsers,
  useSetUserAccessExpiry,
  useUpdateUserLevel,
} from "../hooks/useVedicQueries";

interface VedicAdminPanelProps {
  onBack: () => void;
}

const LEVEL_LABELS: Record<number, string> = {
  1: "Paid",
  2: "Advanced",
};

const LEVEL_COLORS: Record<number, { bg: string; color: string }> = {
  1: { bg: "oklch(0.93 0.05 150 / 0.3)", color: "oklch(0.42 0.18 158)" },
  2: { bg: "oklch(0.93 0.04 200 / 0.3)", color: "oklch(0.48 0.16 220)" },
};

export function VedicAdminPanel({ onBack }: VedicAdminPanelProps) {
  const { data: users = [], isLoading } = useListUsers();
  const { data: freeEmails = [], isLoading: emailsLoading } =
    useGetFreeEmailClaims();
  const createUser = useCreateUser();
  const deleteUser = useDeleteUser();
  const updateLevel = useUpdateUserLevel();
  const setExpiry = useSetUserAccessExpiry();

  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newLevel, setNewLevel] = useState("1");
  const [newDuration, setNewDuration] = useState("0");
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [editUser, setEditUser] = useState<string | null>(null);
  const [editLevel, setEditLevel] = useState("1");
  const [editDuration, setEditDuration] = useState("0");

  async function handleCreate() {
    if (!newUsername.trim() || !newPassword.trim()) {
      toast.error("Username and password are required.");
      return;
    }
    try {
      await createUser.mutateAsync({
        username: newUsername.trim(),
        password: newPassword.trim(),
        sectionLevel: Number(newLevel),
      });
      if (newDuration !== "0") {
        try {
          await setExpiry.mutateAsync({
            username: newUsername.trim(),
            durationDays: Number(newDuration),
          });
        } catch {
          /* ignore expiry error */
        }
      }
      toast.success(`User "${newUsername.trim()}" created.`);
      setNewUsername("");
      setNewPassword("");
      setNewLevel("1");
      setNewDuration("0");
    } catch {
      toast.error("Failed to create user.");
    }
  }

  async function handleDelete(username: string) {
    try {
      await deleteUser.mutateAsync(username);
      toast.success(`User "${username}" deleted.`);
    } catch {
      toast.error("Failed to delete user.");
    }
  }

  async function handleUpdateLevel() {
    if (!editUser) return;
    try {
      await updateLevel.mutateAsync({
        username: editUser,
        sectionLevel: Number(editLevel),
      });
      if (editDuration !== "0") {
        try {
          await setExpiry.mutateAsync({
            username: editUser,
            durationDays: Number(editDuration),
          });
        } catch {
          /* ignore expiry error */
        }
      }
      toast.success(`Access level updated for ${editUser}.`);
      setEditUser(null);
      setEditDuration("0");
    } catch {
      toast.error("Failed to update access level.");
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "oklch(var(--background))" }}
    >
      <header
        className="px-4 py-4 flex items-center gap-4"
        style={{
          background: "oklch(var(--card))",
          borderBottom: "1px solid oklch(var(--border))",
        }}
      >
        <Button
          variant="ghost"
          data-ocid="vedic_admin.secondary_button"
          onClick={onBack}
          className="font-body gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to App
        </Button>
        <div className="flex items-center gap-2">
          <Users
            className="w-5 h-5"
            style={{ color: "oklch(var(--primary))" }}
          />
          <h1
            className="font-display text-xl font-bold"
            style={{ color: "oklch(var(--primary))" }}
          >
            Admin Panel
          </h1>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full p-4 space-y-6">
        <Tabs defaultValue="users">
          <TabsList
            className="w-full"
            style={{ background: "oklch(var(--secondary))" }}
          >
            <TabsTrigger
              value="users"
              className="flex-1 font-body"
              data-ocid="vedic_admin.users.tab"
            >
              <Users className="w-3.5 h-3.5 mr-1.5" /> Users
            </TabsTrigger>
            <TabsTrigger
              value="emails"
              className="flex-1 font-body"
              data-ocid="vedic_admin.emails.tab"
            >
              <Mail className="w-3.5 h-3.5 mr-1.5" /> Free Email Claims
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-4 space-y-6">
            {/* Create User */}
            <div
              className="rounded-lg p-5"
              style={{
                background: "oklch(var(--card))",
                border: "1px solid oklch(var(--border))",
              }}
            >
              <h2
                className="font-display text-base font-semibold mb-4"
                style={{ color: "oklch(var(--primary))" }}
              >
                Create New User
              </h2>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label
                    className="text-xs uppercase tracking-wider font-body"
                    style={{ color: "oklch(var(--muted-foreground))" }}
                  >
                    Username
                  </Label>
                  <Input
                    data-ocid="vedic_admin.create_user.input"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="e.g. rahul123"
                    className="font-body"
                    style={{
                      background: "oklch(var(--input))",
                      borderColor: "oklch(var(--border))",
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    className="text-xs uppercase tracking-wider font-body"
                    style={{ color: "oklch(var(--muted-foreground))" }}
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      data-ocid="vedic_admin.create_password.input"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Set a password"
                      className="font-body pr-10"
                      style={{
                        background: "oklch(var(--input))",
                        borderColor: "oklch(var(--border))",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((v) => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded transition-opacity opacity-60 hover:opacity-100"
                      style={{ color: "oklch(var(--muted-foreground))" }}
                      aria-label={
                        showNewPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label
                    className="text-xs uppercase tracking-wider font-body"
                    style={{ color: "oklch(var(--muted-foreground))" }}
                  >
                    Section Access
                  </Label>
                  <Select value={newLevel} onValueChange={setNewLevel}>
                    <SelectTrigger
                      data-ocid="vedic_admin.section_level.select"
                      className="font-body"
                      style={{
                        background: "oklch(var(--input))",
                        borderColor: "oklch(var(--border))",
                      }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">
                        Paid — Month &amp; Day Charts
                      </SelectItem>
                      <SelectItem value="2">
                        Advanced — All Sections + Predictions
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label
                    className="text-xs uppercase tracking-wider font-body"
                    style={{ color: "oklch(var(--muted-foreground))" }}
                  >
                    Access Duration
                  </Label>
                  <Select value={newDuration} onValueChange={setNewDuration}>
                    <SelectTrigger
                      data-ocid="vedic_admin.duration.select"
                      className="font-body"
                      style={{
                        background: "oklch(var(--input))",
                        borderColor: "oklch(var(--border))",
                      }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Permanent</SelectItem>
                      <SelectItem value="1">1 Day</SelectItem>
                      <SelectItem value="30">1 Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  data-ocid="vedic_admin.create_user.submit_button"
                  onClick={handleCreate}
                  disabled={createUser.isPending}
                  className="w-full font-body font-semibold gap-2"
                  style={{
                    background: "oklch(var(--primary))",
                    color: "oklch(var(--primary-foreground))",
                  }}
                >
                  {createUser.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Create User
                </Button>
              </div>
            </div>

            {/* Users Table */}
            <div
              className="rounded-lg overflow-hidden"
              style={{
                background: "oklch(var(--card))",
                border: "1px solid oklch(var(--border))",
              }}
            >
              <div
                className="px-5 py-3"
                style={{ borderBottom: "1px solid oklch(var(--border))" }}
              >
                <h2
                  className="font-display text-base font-semibold"
                  style={{ color: "oklch(var(--primary))" }}
                >
                  Users ({users.length})
                </h2>
              </div>

              <div className="overflow-y-auto max-h-64">
                {isLoading ? (
                  <div
                    data-ocid="vedic_admin.users.loading_state"
                    className="py-8 text-center font-body text-sm"
                    style={{ color: "oklch(var(--muted-foreground))" }}
                  >
                    <Loader2
                      className="w-5 h-5 animate-spin mx-auto mb-2"
                      style={{ color: "oklch(var(--primary))" }}
                    />
                    Loading users...
                  </div>
                ) : users.length === 0 ? (
                  <div
                    data-ocid="vedic_admin.users.empty_state"
                    className="py-8 text-center font-body text-sm"
                    style={{ color: "oklch(var(--muted-foreground))" }}
                  >
                    No users yet. Create one above.
                  </div>
                ) : (
                  <Table data-ocid="vedic_admin.users.table">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-body font-semibold">
                          Username
                        </TableHead>
                        <TableHead className="font-body font-semibold">
                          Level
                        </TableHead>
                        <TableHead className="font-body font-semibold">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Expiry
                          </span>
                        </TableHead>
                        <TableHead className="font-body font-semibold w-24">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user, idx) => {
                        const lvl = Number(user.sectionLevel);
                        const colors = LEVEL_COLORS[lvl] ?? LEVEL_COLORS[1];
                        return (
                          <TableRow
                            key={user.username}
                            data-ocid={`vedic_admin.users.row.${idx + 1}`}
                          >
                            <TableCell className="font-body font-medium">
                              {user.username}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className="font-body text-xs px-2 py-0.5 rounded-full border-0"
                                style={{
                                  background: colors.bg,
                                  color: colors.color,
                                }}
                              >
                                {LEVEL_LABELS[lvl] ?? `Level ${lvl}`}
                              </Badge>
                            </TableCell>
                            <TableCell
                              className="font-body text-xs"
                              style={{
                                color: "oklch(var(--muted-foreground))",
                              }}
                            >
                              Permanent
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  data-ocid={`vedic_admin.users.edit_button.${idx + 1}`}
                                  onClick={() => {
                                    setEditUser(user.username);
                                    setEditLevel(String(lvl));
                                  }}
                                  className="p-1.5 rounded-md transition-colors"
                                  style={{ color: "oklch(var(--primary))" }}
                                  aria-label={`Edit ${user.username}`}
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  data-ocid={`vedic_admin.users.delete_button.${idx + 1}`}
                                  onClick={() => handleDelete(user.username)}
                                  disabled={deleteUser.isPending}
                                  className="p-1.5 rounded-md transition-colors"
                                  style={{
                                    color: "oklch(var(--muted-foreground))",
                                  }}
                                  aria-label={`Delete ${user.username}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Free Email Claims Tab */}
          <TabsContent value="emails" className="mt-4">
            <div
              className="rounded-lg overflow-hidden"
              style={{
                background: "oklch(var(--card))",
                border: "1px solid oklch(var(--border))",
              }}
            >
              <div
                className="px-5 py-3"
                style={{ borderBottom: "1px solid oklch(var(--border))" }}
              >
                <h2
                  className="font-display text-base font-semibold"
                  style={{ color: "oklch(var(--primary))" }}
                >
                  Free Email Claims ({freeEmails.length})
                </h2>
                <p
                  className="font-body text-xs mt-0.5"
                  style={{ color: "oklch(var(--muted-foreground))" }}
                >
                  Emails that claimed the one-time free prediction.
                </p>
              </div>

              {emailsLoading ? (
                <div
                  data-ocid="vedic_admin.emails.loading_state"
                  className="py-8 text-center font-body text-sm"
                  style={{ color: "oklch(var(--muted-foreground))" }}
                >
                  <Loader2
                    className="w-5 h-5 animate-spin mx-auto mb-2"
                    style={{ color: "oklch(var(--primary))" }}
                  />
                  Loading...
                </div>
              ) : freeEmails.length === 0 ? (
                <div
                  data-ocid="vedic_admin.emails.empty_state"
                  className="py-8 text-center font-body text-sm"
                  style={{ color: "oklch(var(--muted-foreground))" }}
                >
                  No free email claims yet.
                </div>
              ) : (
                <div
                  className="divide-y"
                  style={{ borderColor: "oklch(var(--border))" }}
                >
                  {freeEmails.map((email, idx) => (
                    <div
                      key={email}
                      data-ocid={`vedic_admin.emails.item.${idx + 1}`}
                      className="px-5 py-3 flex items-center gap-3"
                    >
                      <Mail
                        className="w-4 h-4 shrink-0"
                        style={{ color: "oklch(var(--muted-foreground))" }}
                      />
                      <span
                        className="font-body text-sm"
                        style={{ color: "oklch(var(--foreground))" }}
                      >
                        {email}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit Level Dialog */}
      <Dialog
        open={!!editUser}
        onOpenChange={(o) => {
          if (!o) setEditUser(null);
        }}
      >
        <DialogContent data-ocid="vedic_admin.edit_level.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">
              Edit Access Level
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p
              className="font-body text-sm"
              style={{ color: "oklch(var(--muted-foreground))" }}
            >
              User:{" "}
              <strong style={{ color: "oklch(var(--foreground))" }}>
                {editUser}
              </strong>
            </p>
            <div className="space-y-1.5">
              <Label
                className="text-xs uppercase tracking-wider font-body"
                style={{ color: "oklch(var(--muted-foreground))" }}
              >
                Section Access
              </Label>
              <Select value={editLevel} onValueChange={setEditLevel}>
                <SelectTrigger
                  data-ocid="vedic_admin.edit_level.select"
                  className="font-body"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">
                    Paid — Month &amp; Day Charts
                  </SelectItem>
                  <SelectItem value="2">
                    Advanced — All Sections + Predictions
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label
                className="text-xs uppercase tracking-wider font-body"
                style={{ color: "oklch(var(--muted-foreground))" }}
              >
                Access Duration
              </Label>
              <Select value={editDuration} onValueChange={setEditDuration}>
                <SelectTrigger
                  data-ocid="vedic_admin.edit_duration.select"
                  className="font-body"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Permanent</SelectItem>
                  <SelectItem value="1">1 Day</SelectItem>
                  <SelectItem value="30">1 Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="vedic_admin.edit_level.cancel_button"
              onClick={() => setEditUser(null)}
              className="font-body"
            >
              Cancel
            </Button>
            <Button
              data-ocid="vedic_admin.edit_level.confirm_button"
              onClick={handleUpdateLevel}
              disabled={updateLevel.isPending}
              className="font-body font-semibold"
              style={{
                background: "oklch(var(--primary))",
                color: "oklch(var(--primary-foreground))",
              }}
            >
              {updateLevel.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
