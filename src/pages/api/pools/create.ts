import type { APIRoute } from "astro";
import { supabase } from "../../../server/supabase";

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        
        // Ensure only allowed users (admin/qualified_citizen) can create via this endpoint
        // For simplicity, we assume frontend authentication passes a valid token or session
        // In a real app, verify the user session and role here.

        const { data, error } = await supabase.from('pools').insert([
            {
                pool_name: body.pool_name,
                total_payout_amount: body.total_payout_amount,
                cycle_contribution_amount: body.cycle_contribution_amount,
                max_members: body.max_members,
                pool_status_id: 2, // 2 = Forming / Pending
                // If organizer_id was passed, use it, else null
                organizer_id: body.organizer_id || null, 
            }
        ]);

        if (error) {
            console.error("Supabase insert error", error);
            return new Response(JSON.stringify({ error: error.message }), { status: 400 });
        }

        return new Response(JSON.stringify({ success: true, data }), { status: 200 });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};
