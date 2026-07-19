'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

/**
 * Sends a passwordless Magic Link / OTP to the user's email.
 */
export async function signInWithEmailAction(email: string, origin: string) {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error('[signInWithEmailAction] Supabase OTP error:', JSON.stringify(error, null, 2));
    const message =
      error.message ||
      (typeof error === 'object' ? JSON.stringify(error) : String(error));
    return { success: false, error: message || 'Failed to send magic link. Please try again.' };
  }

  return { success: true };
}

/**
 * Signs the current user out and redirects to the login page.
 */
export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
