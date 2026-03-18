-- ============================================================
-- HNP LIVE AUCTION — Complete Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ────────────────────────────────────────────────────────────
-- 1. USERS (public profiles linked to Supabase Auth)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       TEXT UNIQUE NOT NULL,
  username    TEXT UNIQUE NOT NULL,
  full_name   TEXT,
  role        TEXT NOT NULL DEFAULT 'bidder' CHECK (role IN ('bidder','seller','admin')),
  avatar_url  TEXT,
  bio         TEXT,
  total_bids  INT  DEFAULT 0,
  total_wins  INT  DEFAULT 0,
  rating      NUMERIC(3,2) DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- 2. PRODUCTS (auction items)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id     UUID REFERENCES public.users(id) ON DELETE SET NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  category      TEXT NOT NULL,
  image_url     TEXT,
  starting_bid  NUMERIC(12,2) NOT NULL DEFAULT 0,
  current_bid   NUMERIC(12,2) NOT NULL DEFAULT 0,
  reserve_price NUMERIC(12,2),
  buy_now_price NUMERIC(12,2),
  total_bids    INT DEFAULT 0,
  hot           BOOLEAN DEFAULT FALSE,
  featured      BOOLEAN DEFAULT FALSE,
  status        TEXT DEFAULT 'active' CHECK (status IN ('active','ended','sold','cancelled')),
  end_time      TIMESTAMPTZ NOT NULL,
  winner_id     UUID REFERENCES public.users(id) ON DELETE SET NULL,
  views         INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- 3. BIDS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bids (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount      NUMERIC(12,2) NOT NULL,
  status      TEXT DEFAULT 'active' CHECK (status IN ('active','outbid','won','cancelled')),
  is_auto_bid BOOLEAN DEFAULT FALSE,
  max_auto    NUMERIC(12,2),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- 4. WISHLIST
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.wishlist (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ────────────────────────────────────────────────────────────
-- 5. ORDERS (completed auction wins)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id      UUID REFERENCES public.products(id) ON DELETE SET NULL,
  buyer_id        UUID REFERENCES public.users(id) ON DELETE SET NULL,
  seller_id       UUID REFERENCES public.users(id) ON DELETE SET NULL,
  final_price     NUMERIC(12,2) NOT NULL,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','paid','shipped','delivered','cancelled','disputed')),
  payment_method  TEXT DEFAULT 'card',
  tracking_no     TEXT,
  shipping_addr   JSONB,
  notes           TEXT,
  paid_at         TIMESTAMPTZ,
  shipped_at      TIMESTAMPTZ,
  delivered_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- 6. GROUPS (group bidding pools)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.groups (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  product_id   UUID REFERENCES public.products(id) ON DELETE CASCADE,
  creator_id   UUID REFERENCES public.users(id) ON DELETE SET NULL,
  target_bid   NUMERIC(12,2) NOT NULL,
  current_pool NUMERIC(12,2) DEFAULT 0,
  max_members  INT DEFAULT 10,
  status       TEXT DEFAULT 'open' CHECK (status IN ('open','locked','won','lost')),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  ends_at      TIMESTAMPTZ
);

-- ────────────────────────────────────────────────────────────
-- 7. GROUP MEMBERS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.group_members (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id     UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id      UUID REFERENCES public.users(id) ON DELETE CASCADE,
  contribution NUMERIC(12,2) DEFAULT 0,
  joined_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- ────────────────────────────────────────────────────────────
-- 8. NOTIFICATIONS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES public.users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,   -- 'outbid','won','shipped','group','system'
  title      TEXT NOT NULL,
  message    TEXT,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  read       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- HELPER FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_updated BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_users_updated    BEFORE UPDATE ON users    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_orders_updated   BEFORE UPDATE ON orders   FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Increment contribution (used by groups route)
CREATE OR REPLACE FUNCTION increment_contribution(row_id UUID, amount NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE group_members SET contribution = contribution + amount WHERE id = row_id;
END;
$$ LANGUAGE plpgsql;

-- Update group pool total when a member contributes
CREATE OR REPLACE FUNCTION sync_group_pool()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE groups
    SET current_pool = (SELECT COALESCE(SUM(contribution),0) FROM group_members WHERE group_id = NEW.group_id)
  WHERE id = NEW.group_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_pool AFTER INSERT OR UPDATE ON group_members FOR EACH ROW EXECUTE FUNCTION sync_group_pool();

-- Mark previous bids as outbid when new bid is placed
CREATE OR REPLACE FUNCTION mark_outbid()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE bids SET status = 'outbid'
  WHERE product_id = NEW.product_id AND id != NEW.id AND status = 'active';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_mark_outbid AFTER INSERT ON bids FOR EACH ROW EXECUTE FUNCTION mark_outbid();

-- Increment product.total_bids counter
CREATE OR REPLACE FUNCTION increment_product_bids()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products SET total_bids = total_bids + 1, updated_at = NOW() WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_increment_bids AFTER INSERT ON bids FOR EACH ROW EXECUTE FUNCTION increment_product_bids();

-- ============================================================
-- ROW-LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Allow public read on products & users
CREATE POLICY "Public can read products" ON products FOR SELECT USING (TRUE);
CREATE POLICY "Public can read users"    ON users    FOR SELECT USING (TRUE);
CREATE POLICY "Public can read bids"     ON bids     FOR SELECT USING (TRUE);
CREATE POLICY "Public can read groups"   ON groups   FOR SELECT USING (TRUE);
CREATE POLICY "Public can read group_members" ON group_members FOR SELECT USING (TRUE);

-- Authenticated users can write
CREATE POLICY "Users can insert bids"     ON bids     FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Users can insert wishlist" ON wishlist FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Users can read wishlist"   ON wishlist FOR SELECT USING (TRUE);
CREATE POLICY "Users can delete wishlist" ON wishlist FOR DELETE USING (TRUE);
CREATE POLICY "Users can read orders"     ON orders   FOR SELECT USING (TRUE);
CREATE POLICY "Users can insert groups"   ON groups   FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Users can insert members"  ON group_members FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Users can update members"  ON group_members FOR UPDATE USING (TRUE);
CREATE POLICY "Users can insert users"    ON users    FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Users can update users"    ON users    FOR UPDATE USING (TRUE);
CREATE POLICY "Sellers can insert products" ON products FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Sellers can update products" ON products FOR UPDATE USING (TRUE);
CREATE POLICY "Users can read notifications" ON notifications FOR SELECT USING (TRUE);
CREATE POLICY "System can insert notifications" ON notifications FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Users can update notifications" ON notifications FOR UPDATE USING (TRUE);

-- ============================================================
-- REALTIME — Enable for live bidding
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.bids;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ============================================================
-- SEED DATA — HNP Auction Products
-- ============================================================

INSERT INTO public.products (title, description, category, image_url, starting_bid, current_bid, hot, featured, end_time)
VALUES
  ('RTX 5090 Gaming PC',           'Custom 8K gaming beast — 128GB DDR6, 8TB NVMe.',               'High-Tech Gadgets',  '🖥️', 2500,  3800,  TRUE,  TRUE,  NOW() + INTERVAL '3 minutes'),
  ('Neural AR Glasses v3',         'AR glasses with neural gesture control, 8hr battery.',          'High-Tech Gadgets',  '🕶️', 3000,  5400,  TRUE,  FALSE, NOW() + INTERVAL '3 minutes'),
  ('Quantum Drone X9',             'AI-guided stealth drone, 90-min flight, 8K camera.',            'High-Tech Gadgets',  '🚁', 4000,  7800,  TRUE,  FALSE, NOW() + INTERVAL '3 minutes'),
  ('Apple Vision Pro Max',         'Brand-new spatial computing powerhouse with accessories.',       'High-Tech Gadgets',  '🥽', 1500,  2100,  FALSE, FALSE, NOW() + INTERVAL '3 minutes'),
  ('NeuraLink Dev Kit (Beta)',     'Rare beta unit from NeuraLink — BCI interface.',                 'High-Tech Gadgets',  '🧠', 5000,  8900,  TRUE,  TRUE,  NOW() + INTERVAL '3 minutes'),

  ('Cristiano Ronaldo Signed Jersey','Match-worn Al Nassr jersey, personally signed, CoA.',         'Collectibles',       '⚽', 2000,  5100,  TRUE,  TRUE,  NOW() + INTERVAL '3 minutes'),
  ('MSD Signed Cricket Bat',       'Authentic MS Dhoni World Cup 2011 bat, authenticated.',         'Collectibles',       '🏏', 1500,  3400,  TRUE,  FALSE, NOW() + INTERVAL '3 minutes'),
  ('Rare 1st Ed. Pokémon Pack',    '1999 Base Set 1st Edition, factory sealed, PSA graded.',        'Collectibles',       '🃏', 5000,  9200,  TRUE,  TRUE,  NOW() + INTERVAL '3 minutes'),
  ('Signed Michael Jordan Jersey', 'Chicago Bulls #23, PSA/DNA authenticated, framed.',             'Collectibles',       '🏀', 7000, 11500,  TRUE,  TRUE,  NOW() + INTERVAL '3 minutes'),
  ('Ancient Roman Coin Set (12)',  'Certified coins dated 100–400 AD with provenance docs.',        'Collectibles',       '🪙', 1800,  3200,  FALSE, FALSE, NOW() + INTERVAL '3 minutes'),
  ('1959 Gibson Les Paul Guitar',  'Museum-grade original guitar with full provenance papers.',      'Collectibles',       '🎸', 18000, 25000, TRUE,  TRUE,  NOW() + INTERVAL '3 minutes'),

  ('Vintage Rolex Submariner',     'Rare 1970s Rolex, original box & papers included.',             'Luxury & Fashion',   '⌚', 3000,  4200,  TRUE,  TRUE,  NOW() + INTERVAL '3 minutes'),
  ('YSL Tribute Heels (Limited)', 'Yves Saint Laurent Tribute heels, size 38, mint condition.',    'Luxury & Fashion',   '👠', 1200,  1800,  TRUE,  FALSE, NOW() + INTERVAL '3 minutes'),
  ('Christian Louboutin Pumps',   'Iconic red-sole pumps, unworn, size 37, dust bag included.',    'Luxury & Fashion',   '🩰', 1500,  2200,  FALSE, FALSE, NOW() + INTERVAL '3 minutes'),
  ('Nike Air Jordan 1 "Bred"',    'OG 1985 colorway DS, PSA graded Mint 9.',                       'Luxury & Fashion',   '👟', 2000,  3100,  TRUE,  FALSE, NOW() + INTERVAL '3 minutes'),
  ('Bodycon Silk Couture Gown',   'Paris atelier custom silk gown — one of a kind.',               'Luxury & Fashion',   '👗', 3500,  4600,  FALSE, FALSE, NOW() + INTERVAL '3 minutes'),
  ('Bvlgari Diamond Necklace',    '18k gold, 4.5ct certified diamonds, Bvlgari box.',              'Luxury & Fashion',   '💍', 15000, 19800, TRUE,  TRUE,  NOW() + INTERVAL '3 minutes'),

  ('Formula 1 Pit Lane Tour',     'Exclusive F1 pit access + meet drivers at live GP event.',      'Experiences',        '🏎️', 3000, 4800,  TRUE,  TRUE,  NOW() + INTERVAL '3 minutes'),
  ('Private Island Getaway',      '5-night private island stay, butler service, helicopter.',       'Experiences',        '🏝️', 7000, 9900,  TRUE,  TRUE,  NOW() + INTERVAL '3 minutes'),
  ('IPL Stadium VIP Box',         'Full IPL season VIP box seats for two with hospitality.',        'Experiences',        '🏟️', 2000, 2600,  TRUE,  FALSE, NOW() + INTERVAL '3 minutes'),
  ('SpaceX Crew Dragon Seat',     'Once-in-a-lifetime orbital flight seat — ultimate experience.',  'Experiences',        '🚀', 30000,49900,  TRUE,  TRUE,  NOW() + INTERVAL '3 minutes'),

  ('Galaxy Mystery Box',          'Contents include rare collectibles & tech gadgets.',             'Mystery Boxes',      '📦', 299,   399,   FALSE, FALSE, NOW() + INTERVAL '3 minutes'),
  ('Tech Legend Mystery Box',     'Sealed box: contains rare gadget from a tech icon.',             'Mystery Boxes',      '🔮', 1500,  2400,  TRUE,  TRUE,  NOW() + INTERVAL '3 minutes'),
  ('Premium Luxury Mystery Box',  'Guaranteed contents worth 3× the final bid price.',              'Mystery Boxes',      '🎁', 900,   1250,  FALSE, FALSE, NOW() + INTERVAL '3 minutes'),

  ('Monet Original Lithograph',   'Authenticated hand-signed Monet. Museum-quality framing.',      'Art & Memorabilia',  '🎨', 5000,  6500,  TRUE,  TRUE,  NOW() + INTERVAL '3 minutes'),
  ('Apollo 13 Mission Print',     'NASA-authenticated Apollo 13 mission control briefing print.',   'Art & Memorabilia',  '🌍', 6000,  8800,  TRUE,  TRUE,  NOW() + INTERVAL '3 minutes'),
  ('Baroque Oil Painting (Orig.)','17th-century oil on canvas, provenance verified, framed.',      'Art & Memorabilia',  '🖼️', 10000,14000,  TRUE,  FALSE, NOW() + INTERVAL '3 minutes'),
  ('Takashi Murakami Print',      'Signed limited edition 1 of 50. Ships worldwide.',              'Art & Memorabilia',  '🌸', 5500,  7200,  FALSE, FALSE, NOW() + INTERVAL '3 minutes');

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_products_category  ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status    ON products(status);
CREATE INDEX IF NOT EXISTS idx_bids_product       ON bids(product_id);
CREATE INDEX IF NOT EXISTS idx_bids_user          ON bids(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer       ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user      ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
