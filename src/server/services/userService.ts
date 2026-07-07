import { supabase } from '../supabase';

export const getAdminUsers = async () => {
    const { data: users } = await supabase
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

    return users || [];
};
