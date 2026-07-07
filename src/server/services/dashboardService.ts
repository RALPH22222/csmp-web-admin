import { supabase } from '../supabase';

export const getDashboardStats = async () => {
    // Run all queries concurrently to speed up the dashboard load time
    const [poolsRes, usersRes, transactionsRes] = await Promise.all([
        supabase.from('pools').select('*'),
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase
            .from('transactions')
            .select(`
                amount,
                executed_at,
                pool_members ( pools ( pool_name ) ),
                transaction_types ( type_name ),
                transaction_statuses ( status_name )
            `)
            .order('executed_at', { ascending: false })
            .limit(5)
    ]);

    const pools = poolsRes.data;
    const activePoolsCount = pools?.filter(p => p.pool_status_id === 1).length || 0;
    const totalTVL = pools?.reduce((acc, pool) => acc + Number(pool.total_payout_amount || 0), 0) || 0;

    const usersCount = usersRes.count;
    const recentActivity = transactionsRes.data;

    return {
        activePoolsCount,
        totalTVL,
        usersCount: usersCount || 0,
        recentActivity: recentActivity || []
    };
};
