'use client';

import { useUser } from '@clerk/nextjs';
import { resolveUserTier } from '@/lib/auth/tier';

export function useUserTier() {
  const { user, isLoaded } = useUser();
  const tier = resolveUserTier(user);

  return {
    tier,
    isLoaded,
    isGuest: tier === 'Guest',
    isFree: tier === 'Free',
    isPro: tier === 'Pro',
    user,
  };
}
