-- FruitDabba: Push Notifications & Referral System
-- Migration: 002_referrals_and_fcm.sql

-- ──────────────────────────────────────────
-- FCM Device Tokens Table
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fcm_tokens (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token         TEXT NOT NULL UNIQUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fcm_tokens_user_id ON fcm_tokens(user_id);

-- RLS: Users can only manage their own tokens
ALTER TABLE fcm_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own FCM tokens"
  ON fcm_tokens FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role can access all (for sending notifications)
CREATE POLICY "Service role can access all FCM tokens"
  ON fcm_tokens FOR ALL
  USING (auth.role() = 'service_role');

-- ──────────────────────────────────────────
-- Referrals Table
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS referrals (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code               TEXT NOT NULL UNIQUE,
  creator_user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  used_by_user_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referred_order_id  UUID,
  status             TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired')),
  reward_credited    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  used_at            TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_referrals_creator   ON referrals(creator_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code       ON referrals(code);
CREATE INDEX IF NOT EXISTS idx_referrals_status     ON referrals(status);

-- RLS
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referrals"
  ON referrals FOR SELECT
  USING (auth.uid() = creator_user_id OR auth.uid() = used_by_user_id);

CREATE POLICY "Users can insert referral codes"
  ON referrals FOR INSERT
  WITH CHECK (auth.uid() = creator_user_id);

CREATE POLICY "Service role full access to referrals"
  ON referrals FOR ALL
  USING (auth.role() = 'service_role');

-- Allow authenticated users to validate (select) a code by code column
CREATE POLICY "Anyone can read referral by code"
  ON referrals FOR SELECT
  USING (TRUE);

-- ──────────────────────────────────────────
-- User Rewards Table
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_rewards (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type         TEXT NOT NULL DEFAULT 'referral_bonus',
  description  TEXT,
  value        INTEGER NOT NULL DEFAULT 1,   -- number of free boxes
  status       TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'redeemed', 'expired')),
  referral_id  UUID REFERENCES referrals(id) ON DELETE SET NULL,
  expires_at   TIMESTAMPTZ,
  redeemed_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rewards_user_id ON user_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_rewards_status  ON user_rewards(status);

ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rewards"
  ON user_rewards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to rewards"
  ON user_rewards FOR ALL
  USING (auth.role() = 'service_role');

-- ──────────────────────────────────────────
-- Helpful view: referral summary per user
-- ──────────────────────────────────────────
CREATE OR REPLACE VIEW referral_summary AS
SELECT
  r.creator_user_id AS user_id,
  COUNT(*) AS total_referrals,
  COUNT(*) FILTER (WHERE r.status = 'used') AS successful_referrals,
  COUNT(rw.id) FILTER (WHERE rw.status = 'available') AS available_rewards
FROM referrals r
LEFT JOIN user_rewards rw ON rw.referral_id = r.id
GROUP BY r.creator_user_id;
