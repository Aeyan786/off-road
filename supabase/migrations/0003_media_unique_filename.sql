-- Enforce one media item per file name.
--
-- The spreadsheet importer maps a bare file name (e.g. "xyz.png") onto a
-- product image, so two media rows sharing a name would make that mapping
-- ambiguous — a product asking for "xyz.png" could pick up either file.
-- Matching is case-insensitive, so uniqueness has to be too, otherwise
-- "XYZ.png" and "xyz.png" would still collide at lookup time.
--
-- If this fails with a duplicate key error, remove the duplicates first:
--   select lower(file_name), count(*) from media
--   group by 1 having count(*) > 1;

drop index if exists media_file_name_lower_idx;

create unique index if not exists media_file_name_unique_idx
  on media (lower(file_name));
