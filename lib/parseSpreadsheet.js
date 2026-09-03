import Papa from "papaparse";
import * as XLSX from "xlsx";

export const ACCEPTED_EXTENSIONS = [".csv", ".xlsx"];
export const ACCEPTED_MIME_TYPES = [
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export function getFileExtension(fileName) {
  const match = /\.[^.]+$/.exec(fileName ?? "");
  return match ? match[0].toLowerCase() : "";
}

export function isAcceptedSpreadsheet(file) {
  if (!file) return false;
  return ACCEPTED_EXTENSIONS.includes(getFileExtension(file.name));
}

/**
 * Parses a File (from an <input type="file">) into a generic
 * { headers, rows } shape:
 *   headers: string[]                 — column names, taken from row 1
 *   rows:    Record<string, string>[] — one object per data row
 *
 * This is intentionally schema-agnostic — it does not know anything about
 * the product table. Mapping these generic rows into Supabase columns is a
 * separate step to be implemented once the product schema is confirmed.
 */
export async function parseSpreadsheetFile(file) {
  const extension = getFileExtension(file.name);

  if (!ACCEPTED_EXTENSIONS.includes(extension)) {
    throw new Error(
      `Unsupported file type "${extension || "unknown"}". Please upload a .csv or .xlsx file.`
    );
  }

  if (extension === ".csv") {
    return parseCsv(file);
  }

  return parseXlsx(file);
}

function parseCsv(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.meta.fields?.length) {
          reject(new Error("The CSV file appears to be empty or has no header row."));
          return;
        }
        resolve({
          headers: results.meta.fields,
          rows: results.data,
        });
      },
      error: (error) => reject(error),
    });
  });
}

async function parseXlsx(file) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new Error("The workbook has no sheets.");
  }

  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });

  if (!rows.length) {
    throw new Error("The first sheet appears to be empty or has no header row.");
  }

  return {
    headers: Object.keys(rows[0]),
    rows,
  };
}
