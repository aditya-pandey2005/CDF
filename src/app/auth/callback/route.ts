import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/classroom';

  console.log('[auth/callback] Received callback:', { code: code ? 'present' : 'missing', next });

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      console.log('[auth/callback] Session established for:', data.user?.email);
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }

    console.error('[auth/callback] Code exchange failed:', error.message);
  }

  // If there's an error, redirect to login page with an error parameter
  return NextResponse.redirect(`${origin}/login?error=auth-code-error`);
}

