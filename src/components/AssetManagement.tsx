import { useState, useEffect } from "react";
import { fetchAssets, createAsset, updateAsset, deleteAsset, type Asset, ASSET_TYPES, ASSET_STATUSES } from "@/lib/assets";
import { useAuth } from "@/hooks/useAuth";
import { canManageAssets } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, Search, Monitor } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AssetManagement = () => {
  const { role } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [editAsset, setEditAsset] = useState<Asset | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formAssetId, setFormAssetId] = useState("");
  const [formType, setFormType] = useState("");
  const [formSerial, setFormSerial] = useState("");
  const [formUser, setFormUser] = useState("");
  const [formStatus, setFormStatus] = useState("Available");

  const { toast } = useToast();
  const canManage = canManageAssets(role);

  const loadAssets = async () => {
    const data = await fetchAssets();
    setAssets(data);
  };

  useEffect(() => { loadAssets(); }, []);

  const resetForm = () => {
    setFormAssetId(""); setFormType(""); setFormSerial(""); setFormUser(""); setFormStatus("Available");
  };

  const handleOpenAdd = () => { resetForm(); setShowAdd(true); };
  const handleOpenEdit = (a: Asset) => {
    setFormAssetId(a.asset_id); setFormType(a.asset_type); setFormSerial(a.serial_number);
    setFormUser(a.assigned_user); setFormStatus(a.status); setEditAsset(a);
  };

  const handleSave = async () => {
    if (!formAssetId.trim() || !formType) return;
    setLoading(true);

    if (editAsset) {
      const ok = await updateAsset(editAsset.id, {
        asset_id: formAssetId.trim(), asset_type: formType, serial_number: formSerial.trim(),
        assigned_user: formUser.trim(), status: formStatus,
      });
      if (ok) { toast({ title: "Updated", description: `Asset ${formAssetId} updated.` }); setEditAsset(null); loadAssets(); }
      else toast({ title: "Error", description: "Failed to update asset.", variant: "destructive" });
    } else {
      const { data, error } = await createAsset({
        asset_id: formAssetId.trim(), asset_type: formType, serial_number: formSerial.trim(),
        assigned_user: formUser.trim(), status: formStatus,
      });
      if (data) { toast({ title: "Created", description: `Asset ${formAssetId} added.` }); setShowAdd(false); loadAssets(); }
      else toast({ title: "Error", description: error || "Failed to create asset.", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const ok = await deleteAsset(deleteTarget.id);
    if (ok) { toast({ title: "Deleted", description: `Asset ${deleteTarget.asset_id} removed.` }); loadAssets(); }
    else toast({ title: "Error", description: "Failed to delete asset.", variant: "destructive" });
    setDeleteTarget(null);
  };

  const filtered = assets.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch = !search || a.asset_id.toLowerCase().includes(q) || a.asset_type.toLowerCase().includes(q) || a.assigned_user.toLowerCase().includes(q);
    const matchType = filterType === "All" || a.asset_type === filterType;
    const matchStatus = filterStatus === "All" || a.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const statusColor = (s: string) => {
    if (s === "Available") return "bg-status-closed/10 text-status-closed border-status-closed/20";
    if (s === "Assigned") return "bg-status-open/10 text-status-open border-status-open/20";
    if (s === "Under Repair") return "bg-priority-medium/10 text-priority-medium border-priority-medium/20";
    return "bg-muted/20 text-muted-foreground border-muted/30";
  };

  const fieldClass = "bg-secondary/40 rounded-xl";

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Monitor className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Asset Management</h2>
        </div>
        {canManage && (
          <Button size="sm" onClick={handleOpenAdd} className="rounded-xl text-xs h-8" aria-label="Add new asset">
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Asset
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search assets..." value={search} onChange={(e) => setSearch(e.target.value)} className={`pl-9 ${fieldClass}`} aria-label="Search assets" />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className={`w-full sm:w-44 ${fieldClass}`} aria-label="Filter by asset type"><SelectValue /></SelectTrigger>
          <SelectContent className="liquid-glass-strong rounded-xl">
            <SelectItem value="All">All Types</SelectItem>
            {ASSET_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className={`w-full sm:w-36 ${fieldClass}`} aria-label="Filter by status"><SelectValue /></SelectTrigger>
          <SelectContent className="liquid-glass-strong rounded-xl">
            <SelectItem value="All">All Status</SelectItem>
            {ASSET_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-2xl overflow-x-auto liquid-glass-subtle">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {["Asset ID", "Type", "Serial No.", "Assigned To", "Status", ...(canManage ? ["Actions"] : [])].map((h) => (
                <TableHead key={h} className="font-semibold text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={canManage ? 6 : 5} className="text-center py-12 text-muted-foreground">No assets found</TableCell></TableRow>
            ) : filtered.map((a) => (
              <TableRow key={a.id} className="hover:bg-secondary/30 transition-colors">
                <TableCell className="font-mono text-xs text-primary font-medium">{a.asset_id}</TableCell>
                <TableCell className="text-sm">{a.asset_type}</TableCell>
                <TableCell className="text-sm text-muted-foreground font-mono">{a.serial_number || "—"}</TableCell>
                <TableCell className="text-sm">{a.assigned_user || "—"}</TableCell>
                <TableCell><Badge variant="outline" className={`rounded-lg ${statusColor(a.status)}`}>{a.status}</Badge></TableCell>
                {canManage && (
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-primary/10 hover:text-primary" onClick={() => handleOpenEdit(a)} aria-label={`Edit asset ${a.asset_id}`}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/10" onClick={() => setDeleteTarget(a)} aria-label={`Delete asset ${a.asset_id}`}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground text-right">Showing {filtered.length} of {assets.length} assets</p>

      {/* Add / Edit Dialog */}
      <Dialog open={showAdd || !!editAsset} onOpenChange={(o) => { if (!o) { setShowAdd(false); setEditAsset(null); } }}>
        <DialogContent className="liquid-glass-strong rounded-2xl">
          <DialogHeader><DialogTitle>{editAsset ? "Edit Asset" : "Add New Asset"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <label htmlFor="asset-id-input" className="text-xs font-medium text-muted-foreground">Asset ID *</label>
              <Input id="asset-id-input" value={formAssetId} onChange={(e) => setFormAssetId(e.target.value)} placeholder="e.g. AST-001" className={fieldClass} aria-label="Asset ID" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="asset-type-input" className="text-xs font-medium text-muted-foreground">Asset Type *</label>
              <Select value={formType} onValueChange={setFormType}>
                <SelectTrigger id="asset-type-input" className={fieldClass} aria-label="Select asset type"><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent className="liquid-glass-strong rounded-xl">
                  {ASSET_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="serial-input" className="text-xs font-medium text-muted-foreground">Serial Number</label>
              <Input id="serial-input" value={formSerial} onChange={(e) => setFormSerial(e.target.value)} placeholder="Serial number" className={fieldClass} aria-label="Serial number" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="assigned-input" className="text-xs font-medium text-muted-foreground">Assigned User</label>
              <Input id="assigned-input" value={formUser} onChange={(e) => setFormUser(e.target.value)} placeholder="Assigned to" className={fieldClass} aria-label="Assigned user" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="asset-status-input" className="text-xs font-medium text-muted-foreground">Status</label>
              <Select value={formStatus} onValueChange={setFormStatus}>
                <SelectTrigger id="asset-status-input" className={fieldClass} aria-label="Select asset status"><SelectValue /></SelectTrigger>
                <SelectContent className="liquid-glass-strong rounded-xl">
                  {ASSET_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAdd(false); setEditAsset(null); }} className="rounded-xl">Cancel</Button>
            <Button onClick={handleSave} disabled={loading || !formAssetId.trim() || !formType} className="rounded-xl">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editAsset ? "Save Changes" : "Create Asset"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent className="liquid-glass-strong rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Asset</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete asset <strong className="text-primary">{deleteTarget?.asset_id}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AssetManagement;
