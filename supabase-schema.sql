-- ============================================================
-- Objectif Murrayfield — Supabase schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- GPS positions (already existed)
CREATE TABLE IF NOT EXISTS gps_positions (
  id          BIGSERIAL PRIMARY KEY,
  lat         DOUBLE PRECISION NOT NULL,
  lng         DOUBLE PRECISION NOT NULL,
  accuracy    DOUBLE PRECISION,
  timestamp   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source      TEXT NOT NULL CHECK (source IN ('pwa', 'manual'))
);

CREATE INDEX IF NOT EXISTS gps_positions_timestamp_idx ON gps_positions (timestamp DESC);

ALTER TABLE gps_positions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read positions"  ON gps_positions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert positions" ON gps_positions FOR INSERT WITH CHECK (true);
ALTER PUBLICATION supabase_realtime ADD TABLE gps_positions;

-- ============================================================
-- Blog posts
-- ============================================================
CREATE TABLE IF NOT EXISTS posts (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title_fr         TEXT NOT NULL,
  title_en         TEXT,
  slug             TEXT NOT NULL UNIQUE,
  published_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  day              INTEGER,
  location         TEXT,
  lat              DOUBLE PRECISION,
  lng              DOUBLE PRECISION,
  cover_image_url  TEXT,
  body_markdown    TEXT NOT NULL DEFAULT '',
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS posts_published_at_idx ON posts (published_at DESC);
CREATE INDEX IF NOT EXISTS posts_slug_idx ON posts (slug);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read posts"          ON posts FOR SELECT USING (true);
CREATE POLICY "Service role write posts"   ON posts FOR ALL   USING (auth.role() = 'service_role');

-- ============================================================
-- Site settings (singleton — id always 1)
-- ============================================================
CREATE TABLE IF NOT EXISTS site_settings (
  id                  INTEGER PRIMARY KEY DEFAULT 1,
  journey_start_date  DATE,
  total_distance_km   INTEGER NOT NULL DEFAULT 1800,
  instagram_handle    TEXT NOT NULL DEFAULT '',
  donation_url        TEXT NOT NULL DEFAULT '',
  fundraising_goal    INTEGER NOT NULL DEFAULT 5000,
  fundraising_current INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT singleton CHECK (id = 1)
);

INSERT INTO site_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read settings"         ON site_settings FOR SELECT USING (true);
CREATE POLICY "Service role write settings"  ON site_settings FOR ALL   USING (auth.role() = 'service_role');

-- ============================================================
-- Storage bucket for post images
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Public read images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'post-images');

CREATE POLICY "Service role upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'post-images' AND auth.role() = 'service_role');

CREATE POLICY "Service role delete images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'post-images' AND auth.role() = 'service_role');

-- ============================================================
-- Post images (multiple photos per post)
-- ============================================================
CREATE TABLE IF NOT EXISTS post_images (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  position   INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS post_images_post_id_idx ON post_images (post_id, position);

ALTER TABLE post_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read post_images" ON post_images FOR SELECT USING (true);
CREATE POLICY "Service role write post_images" ON post_images FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- Comments
-- ============================================================
CREATE TABLE IF NOT EXISTS comments (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author     TEXT NOT NULL CHECK (char_length(author) BETWEEN 1 AND 50),
  body       TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS comments_post_id_idx ON comments (post_id, created_at);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Public insert comments" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role delete comments" ON comments FOR DELETE USING (auth.role() = 'service_role');

-- ============================================================
-- Bananas (likes with fingerprint dedup)
-- ============================================================
CREATE TABLE IF NOT EXISTS bananas (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id      UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  fingerprint  TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, fingerprint)
);

CREATE INDEX IF NOT EXISTS bananas_post_id_idx ON bananas (post_id);

ALTER TABLE bananas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read bananas" ON bananas FOR SELECT USING (true);
CREATE POLICY "Public insert bananas" ON bananas FOR INSERT WITH CHECK (true);
