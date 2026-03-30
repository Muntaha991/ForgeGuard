import type { UserTier } from '@/store/appStore';

type TierAwareUser = {
  publicMetadata?: {
    tier?: unknown;
  };
} | null | undefined;

export function resolveUserTier(user: TierAwareUser): UserTier {
  if (!user) return 'Guest';

  const rawTier = user.publicMetadata?.tier;
  if (typeof rawTier === 'string' && rawTier.toLowerCase() === 'pro') {
    return 'Pro';
  }

  return 'Free';
}
