import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

type SetTierRequest = {
  tier?: string;
};

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as SetTierRequest;
  const requestedTier = body.tier?.toLowerCase();

  if (requestedTier !== 'pro') {
    return NextResponse.json(
      { error: 'Invalid tier. Only "pro" is supported in demo mode.' },
      { status: 400 }
    );
  }

  const client = await clerkClient();
  const existingUser = await client.users.getUser(userId);
  const existingPublicMetadata = (existingUser.publicMetadata ?? {}) as Record<string, unknown>;

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...existingPublicMetadata,
      tier: 'pro',
    },
  });

  return NextResponse.json({ ok: true, tier: 'pro' });
}
