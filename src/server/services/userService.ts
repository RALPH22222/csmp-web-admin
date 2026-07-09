import { supabaseAdmin } from '../supabase';

export const getAdminUsers = async () => {
    const { data: users, error } = await supabaseAdmin
        .from('users')
        .select(`
            *,
            pool_members (
                id,
                pool_id,
                pools ( pool_statuses ( status_name ) )
            )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching admin users:", error);
    }

    return users || [];
};
