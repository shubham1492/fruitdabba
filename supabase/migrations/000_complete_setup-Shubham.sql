-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. PROFILES (extends auth.users)
-- ============================================================
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 2. ADDRESSES
-- ============================================================
create table if not exists public.addresses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  label text default 'Home',
  line1 text not null,
  line2 text,
  city text not null,
  state text not null,
  pincode text not null,
  is_default boolean default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 3. CATEGORIES & PRODUCTS
-- ============================================================
create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  price numeric(10,2) not null,
  unit text not null default '1 kg',
  image_url text,
  category_id uuid references public.categories(id) on delete set null,
  in_stock boolean not null default true,
  is_featured boolean not null default false,
  nutritional_info jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 4. SUBSCRIPTION PLANS
-- ============================================================
create table if not exists public.subscription_plans (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  price numeric(10,2) not null default 0,
  duration_days integer not null,
  discount_pct numeric(5,2) not null default 0,
  delivery_frequency text not null default 'weekly' check (delivery_frequency in ('daily', 'weekly', 'biweekly', 'monthly')),
  features jsonb,
  is_popular boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  plan_id uuid references public.subscription_plans(id) on delete restrict not null,
  address_id uuid references public.addresses(id) on delete set null,
  start_date date not null default current_date,
  end_date date not null,
  status text not null default 'active' check (status in ('active', 'paused', 'cancelled', 'expired')),
  preferences jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 5. CART & ORDERS
-- ============================================================
create table if not exists public.cart_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);

create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  address_id uuid references public.addresses(id) on delete set null,
  subtotal numeric(10,2) not null,
  discount numeric(10,2) not null default 0,
  delivery_fee numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  status text not null default 'pending' check (status in ('pending','confirmed','processing','shipped','delivered','cancelled','refunded')),
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_image text,
  quantity integer not null,
  unit_price numeric(10,2) not null,
  total_price numeric(10,2) not null,
  created_at timestamptz not null default now()
);

create table if not exists public.order_tracking (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) on delete cascade not null,
  status text not null,
  note text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications_log (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  channel text not null default 'whatsapp',
  message_type text not null,
  phone text,
  status text not null default 'sent' check (status in ('sent','failed','pending')),
  response_data jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 6. REFERRAL SYSTEM & FCM (Push Notifications)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.fcm_tokens (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token         TEXT NOT NULL UNIQUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_user_id ON public.fcm_tokens(user_id);

CREATE TABLE IF NOT EXISTS public.referrals (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code               TEXT NOT NULL UNIQUE,
  creator_user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  used_by_user_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referred_order_id  UUID,
  status             TEXT NOT NULL DEFAULT 'active' check (status in ('active', 'used', 'expired')),
  reward_credited    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  used_at            TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_referrals_creator   ON public.referrals(creator_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code       ON public.referrals(code);
CREATE INDEX IF NOT EXISTS idx_referrals_status     ON public.referrals(status);

CREATE TABLE IF NOT EXISTS public.user_rewards (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type         TEXT NOT NULL DEFAULT 'referral_bonus',
  description  TEXT,
  value        INTEGER NOT NULL DEFAULT 1,   -- number of free boxes
  status       TEXT NOT NULL DEFAULT 'available' check (status in ('available', 'redeemed', 'expired')),
  referral_id  UUID REFERENCES public.referrals(id) ON DELETE SET NULL,
  expires_at   TIMESTAMPTZ,
  redeemed_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rewards_user_id ON public.user_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_rewards_status  ON public.user_rewards(status);

CREATE OR REPLACE VIEW public.referral_summary AS
SELECT
  r.creator_user_id AS user_id,
  COUNT(*) AS total_referrals,
  COUNT(*) FILTER (WHERE r.status = 'used') AS successful_referrals,
  COUNT(rw.id) FILTER (WHERE rw.status = 'available') AS available_rewards
FROM public.referrals r
LEFT JOIN public.user_rewards rw ON rw.referral_id = r.id
GROUP BY r.creator_user_id;

-- ============================================================
-- 7. TRIGGERS
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, phone, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.phone, new.email),
    coalesce(new.phone, new.raw_user_meta_data->>'phone'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at before update on public.products for each row execute procedure public.set_updated_at();

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at before update on public.orders for each row execute procedure public.set_updated_at();

drop trigger if exists set_subscriptions_updated_at on public.subscriptions;
create trigger set_subscriptions_updated_at before update on public.subscriptions for each row execute procedure public.set_updated_at();

-- ============================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.subscription_plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_tracking enable row level security;
alter table public.notifications_log enable row level security;
alter table public.fcm_tokens enable row level security;
alter table public.referrals enable row level security;
alter table public.user_rewards enable row level security;

-- Profiles
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles" on public.profiles for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Addresses
drop policy if exists "Users manage own addresses" on public.addresses;
create policy "Users manage own addresses" on public.addresses for all using (auth.uid() = user_id);

-- Categories & Products & Plans (Public Read)
drop policy if exists "Anyone can view categories" on public.categories;
create policy "Anyone can view categories" on public.categories for select using (true);

drop policy if exists "Admins manage categories" on public.categories;
create policy "Admins manage categories" on public.categories for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

drop policy if exists "Anyone can view products" on public.products;
create policy "Anyone can view products" on public.products for select using (true);

drop policy if exists "Admins manage products" on public.products;
create policy "Admins manage products" on public.products for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

drop policy if exists "Anyone can view plans" on public.subscription_plans;
create policy "Anyone can view plans" on public.subscription_plans for select using (true);

drop policy if exists "Admins manage plans" on public.subscription_plans;
create policy "Admins manage plans" on public.subscription_plans for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Subscriptions & Cart
drop policy if exists "Users view own subscriptions" on public.subscriptions;
create policy "Users view own subscriptions" on public.subscriptions for select using (auth.uid() = user_id);

drop policy if exists "Users create own subscriptions" on public.subscriptions;
create policy "Users create own subscriptions" on public.subscriptions for insert with check (auth.uid() = user_id);

drop policy if exists "Admins manage all subscriptions" on public.subscriptions;
create policy "Admins manage all subscriptions" on public.subscriptions for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

drop policy if exists "Users manage own cart" on public.cart_items;
create policy "Users manage own cart" on public.cart_items for all using (auth.uid() = user_id);

-- Orders
drop policy if exists "Users view own orders" on public.orders;
create policy "Users view own orders" on public.orders for select using (auth.uid() = user_id);

drop policy if exists "Users create own orders" on public.orders;
create policy "Users create own orders" on public.orders for insert with check (auth.uid() = user_id);

drop policy if exists "Admins manage all orders" on public.orders;
create policy "Admins manage all orders" on public.orders for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

drop policy if exists "Users view own order items" on public.order_items;
create policy "Users view own order items" on public.order_items for select using (
  exists (select 1 from public.orders where id = order_id and user_id = auth.uid())
);

drop policy if exists "Admins manage order items" on public.order_items;
create policy "Admins manage order items" on public.order_items for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

drop policy if exists "Users view own order tracking" on public.order_tracking;
create policy "Users view own order tracking" on public.order_tracking for select using (
  exists (select 1 from public.orders where id = order_id and user_id = auth.uid())
);

drop policy if exists "Admins manage order tracking" on public.order_tracking;
create policy "Admins manage order tracking" on public.order_tracking for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Notifications
drop policy if exists "Admins view notifications" on public.notifications_log;
create policy "Admins view notifications" on public.notifications_log for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- FCM Tokens
drop policy if exists "Users can manage own FCM tokens" on public.fcm_tokens;
create policy "Users can manage own FCM tokens" on public.fcm_tokens for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Service role can access all FCM tokens" on public.fcm_tokens;
create policy "Service role can access all FCM tokens" on public.fcm_tokens for all using (auth.role() = 'service_role');

-- Referrals
drop policy if exists "Users can view own referrals" on public.referrals;
create policy "Users can view own referrals" on public.referrals for select using (auth.uid() = creator_user_id OR auth.uid() = used_by_user_id);

drop policy if exists "Users can insert referral codes" on public.referrals;
create policy "Users can insert referral codes" on public.referrals for insert with check (auth.uid() = creator_user_id);

drop policy if exists "Service role full access to referrals" on public.referrals;
create policy "Service role full access to referrals" on public.referrals for all using (auth.role() = 'service_role');

drop policy if exists "Anyone can read referral by code" on public.referrals;
create policy "Anyone can read referral by code" on public.referrals for select using (true);

-- User Rewards
drop policy if exists "Users can view own rewards" on public.user_rewards;
create policy "Users can view own rewards" on public.user_rewards for select using (auth.uid() = user_id);

drop policy if exists "Service role full access to rewards" on public.user_rewards;
create policy "Service role full access to rewards" on public.user_rewards for all using (auth.role() = 'service_role');


-- ============================================================
-- 8b. REVIEWS
-- ============================================================
create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  reviewer_name text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  category text not null,
  title text,
  body text not null,
  image_url text,
  is_approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.reviews enable row level security;

drop policy if exists "Anyone can view approved reviews" on public.reviews;
create policy "Anyone can view approved reviews" on public.reviews for select using (is_approved = true);

drop policy if exists "Anyone can insert reviews" on public.reviews;
create policy "Anyone can insert reviews" on public.reviews for insert with check (true);

drop policy if exists "Admins manage all reviews" on public.reviews;
create policy "Admins manage all reviews" on public.reviews for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

drop trigger if exists set_reviews_updated_at on public.reviews;
create trigger set_reviews_updated_at before update on public.reviews for each row execute procedure public.set_updated_at();


-- ============================================================
-- 9. SEED DATA (Categories & Plans)
-- ============================================================
insert into public.categories (name, slug) values
  ('Seasonal Fruits', 'seasonal'),
  ('Exotic Fruits', 'exotic'),
  ('Citrus', 'citrus'),
  ('Berries', 'berries'),
  ('Tropical', 'tropical'),
  ('Dry Fruits', 'dry-fruits')
on conflict (slug) do nothing;

insert into public.subscription_plans (name, slug, description, price, duration_days, discount_pct, delivery_frequency, is_popular, features) values
  ('Basic Pack', 'basic-pack', 'Weight: 300-350 gms. Minimum 4-5 fruits per day.', 3060.00, 30, 0, 'daily', false, '["Weight: 300-350 gms", "Minimum 4-5 fruits", "Excludes Sundays (26 deliveries)", "Free doorstep delivery", "Sourced fresh daily"]'),
  ('Mini Pack', 'mini-pack', 'Weight: 400-450 gms. Minimum 4-5 fruits per day.', 3580.00, 30, 0, 'daily', false, '["Weight: 400-450 gms", "Minimum 4-5 fruits", "Excludes Sundays (26 deliveries)", "Free doorstep delivery", "Sourced fresh daily"]'),
  ('Medium Pack', 'medium-pack', 'Weight: 500-550 gms. Includes 4-5 fruits + legumes.', 4100.00, 30, 0, 'daily', true, '["Weight: 500-550 gms", "4-5 fruits + healthy legumes", "Excludes Sundays (26 deliveries)", "Free doorstep delivery", "High protein & nutrients"]'),
  ('Premium Pack', 'premium-pack', 'Weight: 700-750 gms. Includes 6-7 fruits + legumes + nuts.', 4620.00, 30, 0, 'daily', false, '["Weight: 700-750 gms", "6-7 fruits + legumes + premium nuts", "Excludes Sundays (26 deliveries)", "Free priority delivery", "Complete daily nutrition"]'),
  ('Gym High Protein Pack', 'gym-protein-pack', 'Daily high-protein salad bowl with premium healthy add-ins.', 4999.00, 30, 0, 'daily', false, '["Daily High-protein salad bowl", "Includes pomegranate, kiwi, paneer/tofu", "Excludes Sundays (26 deliveries)", "Free doorstep delivery", "High protein & fiber-rich"]'),
  ('Corn Chaat & Salad Pack', 'corn-chaat-pack', 'Daily fresh tangy corn chaat and green salad mix.', 3990.00, 30, 0, 'daily', false, '["Daily fresh corn chaat", "Tangy & fiber-rich mix", "Excludes Sundays (26 deliveries)", "Free doorstep delivery", "Perfect afternoon snack"]'),
  ('Custom Dabba Pack', 'custom-pack', 'Fully customized daily health pack based on your choices.', 3000.00, 30, 0, 'daily', false, '["Choose your own ingredients", "Base price of ₹3,000", "Custom categories and exclusions", "Flexible portion pack size", "Add-ons added dynamically"]')
on conflict (slug) do nothing;
