import { supabase } from '../supabase';

export const getAdminPools = async () => {
    const { data: pools } = await supabase
        .from('pools')
        .select(`
            *,
            pool_statuses ( status_name ),
            pool_members ( id ),
            users!pools_organizer_id_fkey ( role )
        `)
        .order('created_at', { ascending: false });

    const allPools = pools || [];

    // Separate based on user role (assumes 'admin' creates institutional pools, 'citizen' or 'qualified_citizen' creates citizen pools)
    const institutionalPools = allPools.filter(p => p.users?.role === 'admin' || !p.users?.role); // Fallback to institutional if role missing
    const citizenPools = allPools.filter(p => p.users?.role === 'citizen' || p.users?.role === 'qualified_citizen');

    return { institutionalPools, citizenPools, allPools };
};
