"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ACCEPTED_EXTENSIONS,
  isAcceptedSpreadsheet,
  parseSpreadsheetFile,
} from "@/lib/parseSpreadsheet";
import { PRODUCT_FIELDS, REQUIRED_PRODUCT_FIELD_KEYS } from "@/lib/product-fields";
import { guessColumnMapping } from "@/lib/guess-column-mapping";
import { cn } from "@/lib/utils";

const BULK_IMPORT_ENDPOINT = "/api/admin/products/bulk-import";

const ACCEPT_ATTR = ".csv,.xlsx";

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function BulkUploadDialog({ trigger, open: openProp, onOpenChange }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState("select"); // select | mapping | result
  const [file, setFile] = useState(null);
  const [parsed, setParsed] = useState(null); // { headers, rows }
  const [mapping, setMapping] = useState({});
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null); // { imported, skipped }
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const isControlled = openProp !== undefined;
  const dialogOpen = isControlled ? openProp : open;

  function setDialogOpen(next) {
    if (isControlled) onOpenChange?.(next);
    else setOpen(next);
    if (!next) {
      resetState();
      if (result) router.refresh();
    }
  }

  function resetState() {
    setPhase("select");
    setFile(null);
    setParsed(null);
    setMapping({});
    setIsBusy(false);
    setError(null);
    setResult(null);
    setDragActive(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleFileSelected(selected) {
    if (!selected) return;
    setError(null);

    if (!isAcceptedSpreadsheet(selected)) {
      setFile(selected);
      setError(
        `"${selected.name}" is not a supported file type. Please upload a .csv or .xlsx file.`
      );
      return;
    }

    setFile(selected);
  }

  async function handleContinue() {
    if (!file) return;
    setIsBusy(true);
    setError(null);

    try {
      const parsedFile = await parseSpreadsheetFile(file);
      setParsed(parsedFile);
      setMapping(guessColumnMapping(parsedFile.headers));
      setPhase("mapping");
    } catch (err) {
      setError(err.message ?? "Something went wrong while reading the file.");
    } finally {
      setIsBusy(false);
    }
  }

  const mappedRequiredKeys = new Set(Object.values(mapping).filter(Boolean));
  const missingRequired = REQUIRED_PRODUCT_FIELD_KEYS.filter(
    (key) => !mappedRequiredKeys.has(key)
  );
  const canImport = missingRequired.length === 0;

  async function handleImport() {
    if (!parsed || !canImport) return;
    setIsBusy(true);
    setError(null);

    try {
      const response = await fetch(BULK_IMPORT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: parsed.rows, mapping }),
      });
      const importResult = await response.json();

      if (!response.ok || importResult?.error) {
        setError(importResult?.error ?? "Import failed.");
        return;
      }

      setResult(importResult);
      setPhase("result");
    } catch (err) {
      setError(err.message ?? "Import failed.");
    } finally {
      setIsBusy(false);
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragActive(false);
    handleFileSelected(event.dataTransfer.files?.[0]);
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {trigger ? <DialogTrigger render={trigger} /> : null}
      <DialogContent className={cn(phase === "mapping" ? "sm:max-w-2xl" : "sm:max-w-lg")}>
        <DialogHeader>
          <DialogTitle>Bulk Upload Products</DialogTitle>
          <DialogDescription>
            {phase === "select" &&
              `Import products from a spreadsheet. Accepted formats: ${ACCEPTED_EXTENSIONS.join(", ")}`}
            {phase === "mapping" &&
              "Match each spreadsheet column to a product field. Required fields must be mapped before importing."}
            {phase === "result" && "Import complete."}
          </DialogDescription>
        </DialogHeader>

        {phase === "select" ? (
          <div className="space-y-4">
            <div
              role="button"
              tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors",
                dragActive
                  ? "border-brand bg-brand/5"
                  : "border-neutral-300 hover:border-neutral-400"
              )}
            >
              <Upload className="size-7 text-neutral-400" />
              <p className="text-sm font-medium text-neutral-700">
                Click to browse or drag a file here
              </p>
              <p className="text-xs text-neutral-400">
                Supported formats: {ACCEPTED_EXTENSIONS.join(", ")}
              </p>
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPT_ATTR}
                className="sr-only"
                onChange={(e) => handleFileSelected(e.target.files?.[0])}
              />
            </div>

            {file ? (
              <div className="flex items-center justify-between rounded-md border bg-neutral-50 px-3 py-2.5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <FileSpreadsheet className="size-4 shrink-0 text-neutral-500" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-neutral-800">
                      {file.name}
                    </p>
                    <p className="text-xs text-neutral-400">{formatBytes(file.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={resetState}
                  aria-label="Remove file"
                  className="shrink-0 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : null}

            {error ? (
              <div className="flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <p>{error}</p>
              </div>
            ) : null}
          </div>
        ) : null}

        {phase === "mapping" && parsed ? (
          <div className="space-y-4">
            <div className="max-h-80 space-y-2 overflow-y-auto rounded-md border p-3">
              {parsed.headers.map((header) => (
                <div key={header} className="flex items-center gap-3">
                  <span className="w-1/2 truncate text-sm font-medium text-neutral-700">
                    {header}
                  </span>
                  <select
                    value={mapping[header] ?? ""}
                    onChange={(e) =>
                      setMapping((prev) => ({ ...prev, [header]: e.target.value }))
                    }
                    className="h-8 w-1/2 rounded-md border border-neutral-300 bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <option value="">None</option>
                    {PRODUCT_FIELDS.map((field) => (
                      <option key={field.key} value={field.key}>
                        {field.label}
                        {field.required ? " *" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="rounded-md bg-neutral-50 px-3 py-2.5 text-xs">
              {missingRequired.length > 0 ? (
                <p className="flex items-start gap-2 text-amber-700">
                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                  Still need to map:{" "}
                  {missingRequired
                    .map((key) => PRODUCT_FIELDS.find((f) => f.key === key)?.label)
                    .join(", ")}
                </p>
              ) : (
                <p className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 className="size-3.5 shrink-0" />
                  All required fields are mapped.
                </p>
              )}
            </div>

            {error ? (
              <div className="flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <p>{error}</p>
              </div>
            ) : null}
          </div>
        ) : null}

        {phase === "result" && result ? (
          <div className="space-y-3">
            <div className="flex items-start gap-2 rounded-md bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
              <p>
                Imported <strong>{result.imported}</strong> product
                {result.imported === 1 ? "" : "s"}. Existing SKUs were
                updated in place.
                {result.categoriesCreated > 0
                  ? ` Created ${result.categoriesCreated} new categor${result.categoriesCreated === 1 ? "y" : "ies"}.`
                  : ""}
              </p>
            </div>

            {result.skipped?.length > 0 ? (
              <div className="space-y-2 rounded-md bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
                <p className="flex items-center gap-2 font-medium">
                  <AlertTriangle className="size-4 shrink-0" />
                  {result.skipped.length} row{result.skipped.length === 1 ? "" : "s"} skipped
                </p>
                <ul className="max-h-40 space-y-1 overflow-y-auto text-xs">
                  {result.skipped.map((s, i) => (
                    <li key={i}>
                      Row {s.row}: {s.reason}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}

        <DialogFooter>
          {phase === "mapping" ? (
            <Button type="button" variant="outline" onClick={() => setPhase("select")}>
              Back
            </Button>
          ) : (
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              {phase === "result" ? "Done" : "Close"}
            </Button>
          )}

          {phase === "select" ? (
            <Button type="button" onClick={handleContinue} disabled={!file || isBusy || !!error}>
              {isBusy ? <Loader2 className="size-4 animate-spin" /> : null}
              Continue
            </Button>
          ) : null}

          {phase === "mapping" ? (
            <Button type="button" onClick={handleImport} disabled={!canImport || isBusy}>
              {isBusy ? <Loader2 className="size-4 animate-spin" /> : null}
              Import {parsed?.rows.length} row{parsed?.rows.length === 1 ? "" : "s"}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
