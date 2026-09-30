/**
 * Upload size limits, shared by the media library, the product form and the
 * server actions behind them — so the browser and the server always agree.
 *
 * Uploads travel through Server Actions, whose request body is capped by
 * `serverActions.bodySizeLimit` in next.config.mjs (50MB). A request over
 * that limit is rejected by the framework before our code runs, which
 * surfaces as an unhandled error, so these limits stay comfortably under it
 * and are checked before anything is sent.
 */

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB per image
export const MAX_ZIP_BYTES = 40 * 1024 * 1024; // 40MB per ZIP archive
export const MAX_BATCH_BYTES = 40 * 1024 * 1024; // 40MB per upload request
export const MAX_SPREADSHEET_BYTES = 10 * 1024 * 1024; // 10MB per .csv/.xlsx
export const MAX_IMPORT_ROWS = 5000; // rows per bulk product import

export function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value >= 10 || index === 0 ? Math.round(value) : value.toFixed(1)} ${units[index]}`;
}

/**
 * Checks files chosen for an image upload.
 * @returns {string|null} a message to show, or null when they're fine.
 */
export function checkImageFiles(files) {
  const list = [...files];
  const tooBig = list.filter((file) => file.size > MAX_IMAGE_BYTES);
  if (tooBig.length > 0) {
    const names = tooBig.map((file) => `${file.name} (${formatBytes(file.size)})`).join(", ");
    return `${tooBig.length === 1 ? "This image is" : "These images are"} larger than ${formatBytes(
      MAX_IMAGE_BYTES
    )}: ${names}. Please resize ${tooBig.length === 1 ? "it" : "them"} and try again.`;
  }

  const total = list.reduce((sum, file) => sum + file.size, 0);
  if (total > MAX_BATCH_BYTES) {
    return `Those ${list.length} images come to ${formatBytes(total)}. Please upload up to ${formatBytes(
      MAX_BATCH_BYTES
    )} at a time.`;
  }

  return null;
}

/**
 * Checks a file chosen for a ZIP import.
 * @returns {string|null} a message to show, or null when it's fine.
 */
export function checkZipFile(file) {
  if (!file) return null;
  if (file.size > MAX_ZIP_BYTES) {
    return `"${file.name}" is ${formatBytes(file.size)}. ZIP files must be ${formatBytes(
      MAX_ZIP_BYTES
    )} or smaller — please split the archive and import it in parts.`;
  }
  return null;
}

/**
 * Checks a file chosen for the bulk product import. The spreadsheet is
 * parsed in the browser, so an oversized one freezes the tab long before
 * anything is sent.
 * @returns {string|null} a message to show, or null when it's fine.
 */
export function checkSpreadsheetFile(file) {
  if (!file) return null;
  if (file.size > MAX_SPREADSHEET_BYTES) {
    return `"${file.name}" is ${formatBytes(file.size)}. Spreadsheets must be ${formatBytes(
      MAX_SPREADSHEET_BYTES
    )} or smaller — please split the file and import it in parts.`;
  }
  return null;
}

/**
 * Checks how many rows a parsed spreadsheet holds.
 * @returns {string|null} a message to show, or null when it's fine.
 */
export function checkImportRows(count) {
  if (count > MAX_IMPORT_ROWS) {
    return `That file has ${count.toLocaleString("en-GB")} rows. Please import up to ${MAX_IMPORT_ROWS.toLocaleString(
      "en-GB"
    )} rows at a time.`;
  }
  return null;
}
