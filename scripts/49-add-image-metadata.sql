-- Migration: Add image metadata support (caption, credit/source)
-- The media_urls column already stores JSONB, we just need to update the structure
-- Old format: ["url1", "url2"] or [{url: "url1"}, ...]
-- New format: [{url: "url1", caption: "...", credit: "..."}, ...]

-- No schema change needed since media_urls is already JSONB
-- This migration just documents the new expected format

-- Example of the new format:
-- [
--   {
--     "url": "https://example.com/image1.jpg",
--     "caption": "A beautiful sunset over the mountains",
--     "credit": "Photo by John Doe / Unsplash"
--   },
--   {
--     "url": "https://example.com/image2.jpg",
--     "caption": null,
--     "credit": "Reuters"
--   }
-- ]

-- The application code will handle backward compatibility with the old format
-- (plain URL strings will be converted to objects with just the url field)

COMMENT ON COLUMN stories.media_urls IS 'JSON array of media objects with url, caption (optional), and credit (optional) fields. Supports both legacy string format and new object format.';
