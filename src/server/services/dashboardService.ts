import { supabaseAdmin } from '../supabase';

export const getDashboardStats = async () => {
    // Run all queries concurrently. We append .then(res => res) to convert PostgrestBuilders into native Promises
    // which prevents Astro's SSR Promise.all from hanging indefinitely.
    const [poolsRes, usersRes, transactionsRes] = await Promise.all([
        supabaseAdmin.from('pools').select('*').then(res => res),
        // Fetch all users with their address (limit to 1000 for safety on large datasets)
        supabaseAdmin.from('users').select('address', { count: 'exact' }).limit(1000).then(res => res),
        supabaseAdmin
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
            .then(res => res)
    ]);

    const pools = poolsRes.data || [];
    const activePoolsCount = pools.filter(p => p.pool_status_id === 1).length;
    const pendingPoolsCount = pools.filter(p => p.pool_status_id !== 1).length;
    const totalTVL = pools.reduce((acc, pool) => acc + Number(pool.total_payout_amount || 0), 0);
    
    // Dynamic Liquidity Score based on active vs total pools
    const liquidityScore = pools.length > 0 ? Math.round((activePoolsCount / pools.length) * 100) : 0;

    const usersCount = usersRes.count || 0;
    const addresses = (usersRes.data || []).map(u => u.address).filter(Boolean);
    
    // Assuming a fraction of total users are verified agents for the MVP
    const verifiedAgentsCount = Math.floor(usersCount * 0.8) || 0;

    const recentActivity = transactionsRes.data || [];

    // Calculate this month's disbursements
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyDisbursements = recentActivity
        .filter(t => {
            const date = new Date(t.executed_at);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        })
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    return {
        activePoolsCount,
        totalTVL,
        usersCount,
        addresses,
        recentActivity,
        liquidityScore,
        pendingPoolsCount,
        verifiedAgentsCount,
        monthlyDisbursements
    };
};
