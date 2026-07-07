import { supabase } from '../supabase';

export const getAdminPools = async () => {
    const { data: pools } = await supabase
        .from('pools')
        .select(`
            *,
            pool_statuses ( status_name ),
            pool_members ( id )
        `)
        .order('created_at', { ascending: false });

    return pools || [];
};
