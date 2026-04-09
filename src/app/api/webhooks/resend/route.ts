import { db } from '@/db/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Webhook } from 'svix';
import { headers } from 'next/headers';

// Add RESEND_WEBHOOK_SECRET to your .env.local
// Get it from: Resend Dashboard → Webhooks → your webhook → Signing Secret
const WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET;

export async function POST(req: Request) {
  if (!WEBHOOK_SECRET) {
    console.error('[Resend Webhook] RESEND_WEBHOOK_SECRET is not set.');
    return new Response('Webhook secret not configured', { status: 500 });
  }

  // Verify the webhook signature using svix (used internally by Resend)
  const headersList = await headers();
  const svixId = headersList.get('svix-id');
  const svixTimestamp = headersList.get('svix-timestamp');
  const svixSignature = headersList.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  const body = await req.text();

  let payload: any;
  try {
    const wh = new Webhook(WEBHOOK_SECRET);
    payload = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });
  } catch (err) {
    console.error('[Resend Webhook] Invalid signature:', err);
    return new Response('Invalid signature', { status: 401 });
  }

  const { type, data } = payload;

  // Handle hard bounces — the email address does not exist
  if (type === 'email.bounced') {
    const bouncedEmail = data?.to?.[0];
    const bounceType = data?.bounce?.type; // 'hard' | 'soft'

    if (bouncedEmail && bounceType === 'hard') {
      try {
        await db
          .update(users)
          .set({ emailBounced: true })
          .where(eq(users.email, bouncedEmail));
        
        console.log(`[Resend Webhook] Marked hard bounce for: ${bouncedEmail}`);
      } catch (err) {
        console.error('[Resend Webhook] DB update failed:', err);
      }
    }
  }

  return Response.json({ received: true });
}
