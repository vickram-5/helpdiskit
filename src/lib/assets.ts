import { supabase } from "@/integrations/supabase/client";

export interface Asset {
  id: string;
  asset_id: string;
  asset_type: string;
  serial_number: string;
  assigned_user: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export const ASSET_TYPES = [
  "Desktop/Thin Client",
  "Headset",
  "Braille Keyboard",
  "Specialized Ergonomics",
  "IP Phone",
];

export const ASSET_STATUSES = ["Available", "Assigned", "Under Repair", "Decommissioned"];

export const fetchAssets = async (): Promise<Asset[]> => {
  const { data, error } = await supabase
    .from("assets")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching assets:", error);
    return [];
  }
  return (data || []) as unknown as Asset[];
};

export const createAsset = async (asset: Omit<Asset, "id" | "created_at" | "updated_at">): Promise<{ data: Asset | null; error: string | null }> => {
  const { data, error } = await supabase
    .from("assets")
    .insert(asset as any)
    .select()
    .single();
  if (error) return { data: null, error: error.message };
  return { data: data as unknown as Asset, error: null };
};

export const updateAsset = async (id: string, updates: Partial<Asset>): Promise<boolean> => {
  const { error } = await supabase
    .from("assets")
    .update(updates as any)
    .eq("id", id);
  if (error) {
    console.error("Error updating asset:", error);
    return false;
  }
  return true;
};

export const deleteAsset = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from("assets").delete().eq("id", id);
  if (error) {
    console.error("Error deleting asset:", error);
    return false;
  }
  return true;
};
