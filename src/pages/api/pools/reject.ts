import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  (import.meta.env.PUBLIC_SUPABASE_URL ?? process.env.PUBLIC_SUPABASE_URL),
  (import.meta.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY)
);

export const POST: APIRoute = async ({ request }) => {
  try {
    const { pool_id } = await request.json();

    if (!pool_id) {
      return new Response(JSON.stringify({ error: 'pool_id is required' }), { status: 400 });
    }

    // Update status to 4 (CANCELLED)
    const { data, error } = await supabase
      .from('pools')
      .update({ pool_status_id: 4 })
      .eq('id', pool_id);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, message: 'Pool rejected' }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
