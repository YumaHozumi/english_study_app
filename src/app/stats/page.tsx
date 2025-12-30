import { auth } from '@/lib/auth';
import { getStatsPageData } from '@/actions/stats';
import { StatsView } from '@/components/Stats/StatsView';

export default async function StatsPage() {
    const session = await auth();
    const isAuthenticated = !!session?.user?.id;

    const { stats, history } = await getStatsPageData();

    return (
        <StatsView
            stats={stats}
            history={history}
            isAuthenticated={isAuthenticated}
        />
    );
}
