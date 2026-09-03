/**
 * Single source of truth for the product schema shape, shared by the
 * add/edit form and the bulk-upload column-mapping UI.
 *
 * The three category_level* fields let a spreadsheet spread its category
 * hierarchy across separate columns (e.g. "Category" / "Subcategory" /
 * "Sub-subcategory"). During import, whichever levels are mapped and
 * non-empty for a row are resolved (find-or-create) into the categories
 * tree, and the product attaches to the deepest one provided.
 */
export const PRODUCT_FIELDS = [
  { key: "product", label: "Product Name", type: "text", required: true },
  { key: "sku", label: "SKU", type: "text", required: true },
  { key: "price", label: "Price", type: "number", required: true },
  { key: "quantity", label: "Quantity", type: "number", required: false },
  { key: "category_level1", label: "Category", type: "text", required: false },
  { key: "category_level2", label: "Subcategory", type: "text", required: false },
  { key: "category_level3", label: "Sub-subcategory", type: "text", required: false },
  { key: "supplier", label: "Supplier", type: "text", required: false },
  { key: "manufacturer", label: "Manufacturer", type: "text", required: false },
  { key: "model", label: "Model", type: "text", required: false },
  { key: "year", label: "Year", type: "text", required: false },
  { key: "description", label: "Description", type: "text", required: false },
  { key: "small_description", label: "Short Description", type: "text", required: false },
  { key: "additional_information", label: "Additional Information", type: "text", required: false },
  { key: "images", label: "Image URLs (comma separated)", type: "text", required: false },
  { key: "width", label: "Width", type: "number", required: false },
  { key: "length", label: "Length", type: "number", required: false },
  { key: "height", label: "Height", type: "number", required: false },
  { key: "weight_grams", label: "Weight (grams)", type: "number", required: false },
];

export const REQUIRED_PRODUCT_FIELD_KEYS = PRODUCT_FIELDS.filter(
  (f) => f.required
).map((f) => f.key);

export const CATEGORY_FIELD_KEYS = [
  "category_level1",
  "category_level2",
  "category_level3",
];
