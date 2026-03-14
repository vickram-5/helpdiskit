import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BulkImportProps {
  onImported: () => void;
  userId: string;
}

const EXPECTED_HEADERS = [
  "User Name", "Process", "Reported By", "Priority",
  "Technician Name", "Issue Category", "Sub-category",
  "Request Status", "Remarks", "Start Time", "End Time", "Created Date",
];

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  // Handle both comma and tab delimiters
  const delimiter = lines[0].includes("\t") ? "\t" : ",";
  const headers = lines[0].split(delimiter).map((h) => h.replace(/^"|"$/g, "").trim());

  return lines.slice(1).map((line) => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter.charAt(0) && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = values[i] || "";
    });
    return row;
  });
}

const BulkImport = ({ onImported, userId }: BulkImportProps) => {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ created: number; skipped: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["csv", "txt", "tsv"].includes(ext || "")) {
      toast({ title: "Invalid file", description: "Please upload a CSV file.", variant: "destructive" });
      return;
    }

    setImporting(true);
    setResult(null);

    try {
      const text = await file.text();
      const rows = parseCSV(text);

      if (rows.length === 0) {
        toast({ title: "Empty file", description: "No data rows found in the file.", variant: "destructive" });
        setImporting(false);
        return;
      }

      // Validate that at least "User Name" and "Issue Category" columns exist
      const firstRow = rows[0];
      const hasUserName = "User Name" in firstRow || "user_name" in firstRow;
      const hasCategory = "Issue Category" in firstRow || "issue_category" in firstRow;

      if (!hasUserName || !hasCategory) {
        toast({
          title: "Missing columns",
          description: "CSV must have 'User Name' and 'Issue Category' columns at minimum.",
          variant: "destructive",
        });
        setImporting(false);
        return;
      }

      // Cap at 500 rows for safety
      const cappedRows = rows.slice(0, 500);

      const { data, error } = await supabase.functions.invoke("import-sheet", {
        body: { rows: cappedRows, created_by: userId },
      });

      if (error) {
        toast({ title: "Import failed", description: error.message, variant: "destructive" });
      } else {
        setResult({ created: data.created || 0, skipped: data.skipped || 0 });
        toast({
          title: "Import Complete",
          description: `${data.created || 0} tickets created, ${data.skipped || 0} skipped.`,
        });
        onImported();
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to process file", variant: "destructive" });
    }

    setImporting(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="liquid-glass rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <FileSpreadsheet className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Bulk Import from CSV/Excel</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Upload a CSV file with columns: {EXPECTED_HEADERS.slice(0, 4).join(", ")}, etc.
        Each row will create a new ticket automatically.
      </p>

      <input
        ref={fileRef}
        type="file"
        accept=".csv,.tsv,.txt"
        className="hidden"
        onChange={handleFile}
      />

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl text-xs border-border hover:bg-primary/10 hover:text-primary bg-secondary/30"
          onClick={() => fileRef.current?.click()}
          disabled={importing}
        >
          {importing ? (
            <><Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> Importing...</>
          ) : (
            <><Upload className="mr-1 h-3.5 w-3.5" /> Upload CSV</>
          )}
        </Button>

        {result && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-status-closed" />
            {result.created} created, {result.skipped} skipped
          </span>
        )}
      </div>
    </div>
  );
};

export default BulkImport;
