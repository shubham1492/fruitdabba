/**
 * FruitDabba Referral System
 * Handles: code generation, validation, application, and reward tracking.
 * Reward: 1 free box (credited as a discount coupon on next order)
 */

import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// ──────────────────────────────────────────
// Types
// ──────────────────────────────────────────

export interface ReferralCode {
  id: string;
  code: string;
  creator_user_id: string;
  creator_name?: string;
  used_by_user_id?: string | null;
  status: 'active' | 'used' | 'expired';
  reward_credited: boolean;
  created_at: string;
  used_at?: string | null;
}

// ──────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────

/**
 * Generate a unique 8-character alphanumeric code.
 * E.g. "FD-X7K2PM"
 */
function generateCode(prefix = 'FD'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I for readability
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${prefix}-${code}`;
}

// ──────────────────────────────────────────
// API functions
// ──────────────────────────────────────────

/**
 * Get or create a referral code for the current user.
 * Each user gets exactly one permanent referral code.
 */
export async function getOrCreateReferralCode(userId: string): Promise<ReferralCode | null> {
  // Check if user already has a code
  const { data: existing, error } = await supabase
    .from('referrals')
    .select('*')
    .eq('creator_user_id', userId)
    .eq('status', 'active')
    .is('used_by_user_id', null)
    .limit(1)
    .single();

  if (existing && !error) return existing as ReferralCode;

  // Also check if they have a used one (to return their original code)
  const { data: any_existing } = await supabase
    .from('referrals')
    .select('*')
    .eq('creator_user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (any_existing) return any_existing as ReferralCode;

  // Create new code
  let code = generateCode();
  let attempts = 0;

  while (attempts < 5) {
    const { data: created, error: createError } = await supabase
      .from('referrals')
      .insert({
        code,
        creator_user_id: userId,
        status: 'active',
        reward_credited: false,
      })
      .select()
      .single();

    if (!createError) return created as ReferralCode;

    // Code collision — try a new one
    code = generateCode();
    attempts++;
  }

  return null;
}

/**
 * Validate a referral code entered by a new user.
 * Returns the referral row if valid, null if not.
 */
export async function validateReferralCode(
  code: string,
  newUserId: string
): Promise<{ valid: boolean; referral?: ReferralCode; error?: string }> {
  if (!code?.trim()) return { valid: false, error: 'No code provided' };

  const { data, error } = await supabase
    .from('referrals')
    .select('*')
    .eq('code', code.toUpperCase().trim())
    .eq('status', 'active')
    .single();

  if (error || !data) return { valid: false, error: 'Invalid or expired referral code' };

  const referral = data as ReferralCode;

  // Cannot use your own code
  if (referral.creator_user_id === newUserId) {
    return { valid: false, error: 'You cannot use your own referral code' };
  }

  // Already used
  if (referral.used_by_user_id) {
    return { valid: false, error: 'This referral code has already been used' };
  }

  return { valid: true, referral };
}

/**
 * Apply a referral code after a successful order.
 * - Marks the code as used
 * - Credits reward (1 free box) to the referring user
 */
export async function applyReferralCode(
  code: string,
  newUserId: string,
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  const validation = await validateReferralCode(code, newUserId);
  if (!validation.valid || !validation.referral) {
    return { success: false, error: validation.error };
  }

  const referral = validation.referral;

  // Mark code as used
  const { error: updateError } = await supabase
    .from('referrals')
    .update({
      used_by_user_id: newUserId,
      used_at: new Date().toISOString(),
      status: 'used',
      referred_order_id: orderId,
    })
    .eq('id', referral.id);

  if (updateError) return { success: false, error: updateError.message };

  // Credit reward to referring user (insert into rewards table)
  await supabase.from('user_rewards').insert({
    user_id: referral.creator_user_id,
    type: 'referral_bonus',
    description: '1 Free Box — Referral Reward 🎁',
    value: 1, // 1 free box
    status: 'available',
    expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
    referral_id: referral.id,
  });

  // Mark reward as credited
  await supabase
    .from('referrals')
    .update({ reward_credited: true })
    .eq('id', referral.id);

  return { success: true };
}

/**
 * Get all referrals created by a user (for the referral dashboard).
 */
export async function getUserReferrals(userId: string): Promise<ReferralCode[]> {
  const { data } = await supabase
    .from('referrals')
    .select('*')
    .eq('creator_user_id', userId)
    .order('created_at', { ascending: false });

  return (data as ReferralCode[]) || [];
}

/**
 * Get available rewards for a user.
 */
export async function getUserRewards(userId: string) {
  const { data } = await supabase
    .from('user_rewards')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'available')
    .order('created_at', { ascending: false });

  return data || [];
}
