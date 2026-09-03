import { PRODUCT_FIELDS } from "@/lib/product-fields";

function normalize(value) {
  return value.toString().trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

const ALIASES = {
  product: ["productname", "name", "title"],
  category_level1: ["category", "categories", "maincategory", "topcategory"],
  category_level2: ["subcategory", "sub category", "subcat"],
  category_level3: [
    "subsubcategory",
    "sub sub category",
    "childcategory",
    "leafcategory",
  ],
  weight_grams: ["weight", "weightg", "weightgrams"],
  images: ["image", "imageurl", "imageurls", "photo", "photos"],
  additional_information: ["additionalinfo", "additionalinformation"],
  small_description: ["shortdescription", "smalldescription"],
};

for (const key of Object.keys(ALIASES)) {
  ALIASES[key] = ALIASES[key].map(normalize);
}

/** Best-effort default mapping from spreadsheet headers to product fields. */
export function guessColumnMapping(headers) {
  const mapping = {};
  const takenFields = new Set();

  for (const header of headers) {
    const normalized = normalize(header);
    const match = PRODUCT_FIELDS.find((field) => {
      if (takenFields.has(field.key)) return false;
      if (normalize(field.key) === normalized) return true;
      if (normalize(field.label) === normalized) return true;
      return (ALIASES[field.key] ?? []).includes(normalized);
    });
    mapping[header] = match?.key ?? "";
    if (match) takenFields.add(match.key);
  }

  return mapping;
}
