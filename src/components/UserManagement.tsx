import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { UserPlus, Trash2, Loader2, Pencil, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserProfile {
  user_id: string;
  username: string;
  full_name: string;
  role: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("technician");
  const [deleteUser, setDeleteUser] = useState<UserProfile | null>(null);
  const { toast } = useToast();

  const fetchUsers = async () => {
    const { data } = await supabase.functions.invoke("manage-users", {
      body: { action: "list" },
    });
    if (data?.profiles && data?.roles) {
      const merged = data.profiles.map((p: any) => ({
        ...p,
        role: data.roles.find((r: any) => r.user_id === p.user_id)?.role || "technician",
      }));
      setUsers(merged);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async () => {
    setLoading(true);
    const autoEmail = `${username.toLowerCase().replace(/\s+/g, '')}@cybervibe.local`;
    const { data, error } = await supabase.functions.invoke("manage-users", {
      body: { action: "create", email: autoEmail, password, username, full_name: fullName, role },
    });
    if (data?.error || error) {
      toast({ title: "Error", description: data?.error || error?.message, variant: "destructive" });
    } else {
      toast({ title: "User created", description: `${username} added as ${role}.` });
      setShowAdd(false);
      setPassword(""); setUsername(""); setFullName(""); setRole("technician");
      fetchUsers();
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    const { data } = await supabase.functions.invoke("manage-users", {
      body: { action: "delete", user_id: deleteUser.user_id },
    });
    if (data?.error) {
      toast({ title: "Error", description: data.error, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: `${deleteUser.username} removed.` });
      fetchUsers();
    }
    setDeleteUser(null);
  };

  const filteredUsers = users.filter((u) =>
    !searchQuery ||
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fieldClass = "bg-secondary/40 rounded-xl";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">User Management</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-9 w-48 h-8 text-xs ${fieldClass}`}
            />
          </div>
          <Button size="sm" onClick={() => setShowAdd(true)} className="rounded-xl text-xs h-8">
            <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Add User
          </Button>
        </div>
      </div>

      <div className="rounded-2xl overflow-x-auto liquid-glass-subtle">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-medium text-muted-foreground">Username</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Display Name</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Role</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Status</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((u) => (
              <TableRow key={u.user_id} className="hover:bg-secondary/30 transition-colors">
                <TableCell className="font-medium text-primary text-sm">{u.username}</TableCell>
                <TableCell className="text-sm">{u.full_name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm">
                    <span className={`text-xs ${u.role === "admin" ? "text-primary" : "text-muted-foreground"}`}>
                      {u.role === "admin" ? "⚙" : "🔧"}
                    </span>
                    <span className="capitalize">{u.role === "admin" ? "Admin" : "Technician"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className="bg-status-closed/12 text-status-closed border-status-closed/20 rounded-md text-[10px]">
                    Active
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end">
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-primary/10 hover:text-primary">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteUser(u)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="liquid-glass-strong rounded-2xl">
          <DialogHeader><DialogTitle>Add New User</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Username *</label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="johndoe" className={fieldClass} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Full Name *</label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" className={fieldClass} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Password *</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={fieldClass} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Role</label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className={fieldClass}><SelectValue /></SelectTrigger>
                <SelectContent className="liquid-glass-strong rounded-xl">
                  <SelectItem value="technician">Technician</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleCreate} disabled={loading || !password || !username || !fullName} className="rounded-xl">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteUser} onOpenChange={(o) => !o && setDeleteUser(null)}>
        <AlertDialogContent className="liquid-glass-strong rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteUser?.username}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserManagement;
