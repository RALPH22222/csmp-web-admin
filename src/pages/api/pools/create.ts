import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { pool_name, total_payout_amount, cycle_contribution_amount, max_members, cycle_duration_days } = body;
    
    if (!pool_name || !total_payout_amount || !cycle_contribution_amount || !max_members) {
       return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // Use Service Role to ensure we can create it
    const supabase = createClient(
      (import.meta.env.PUBLIC_SUPABASE_URL ?? process.env.PUBLIC_SUPABASE_URL),
      (import.meta.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY)
    );

    // Get the user from the cookie if available
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;
    
    let organizer_id = null;
    
    if (accessToken && refreshToken) {
       // Validate the session and get the user
       const authSupabase = createClient(
         (import.meta.env.PUBLIC_SUPABASE_URL ?? process.env.PUBLIC_SUPABASE_URL),
         (import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? process.env.PUBLIC_SUPABASE_ANON_KEY)
       );
       const { data: { session }, error } = await authSupabase.auth.setSession({
         access_token: accessToken,
         refresh_token: refreshToken
       });
       if (session?.user?.id) {
          organizer_id = session.user.id;
       }
    }

    // Use the actually deployed Soroban contract address from testnet
    const soroban_contract_address = 'CAWHCPHYWKP7JEHFBZZ5P7PNWLMV2DZC77C3U2HM45CHJQEIBGCIOW4C';

    const { data, error } = await supabase
      .from('pools')
      .insert({
        pool_name,
        total_payout_amount,
        cycle_contribution_amount,
        max_members,
        cycle_duration_days,
        pool_status_id: 1, // FORMING for admin created pools
        organizer_id: organizer_id,
        soroban_contract_address
      })
      .select()
      .single();

    if (error) {
      console.error("Pool creation error:", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
    
    return new Response(JSON.stringify({ success: true, data }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
