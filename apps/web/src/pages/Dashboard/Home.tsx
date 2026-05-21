import EcommerceMetrics from '../../components/ecommerce/EcommerceMetrics';
import MonthlySalesChart from '../../components/ecommerce/MonthlySalesChart';
import StatisticsChart from '../../components/ecommerce/StatisticsChart';
import MonthlyTarget from '../../components/ecommerce/MonthlyTarget';
import RecentOrders from '../../components/ecommerce/RecentOrders';
import DemographicCard from '../../components/ecommerce/DemographicCard';
import PageMeta from '../../components/common/PageMeta';
import { useComponentPermission } from '../../hooks/useComponentPermission';

export default function Home() {
    const hasEcommerceMetrics = useComponentPermission('ecommerce-metrics');
    const hasMonthlySales = useComponentPermission('monthly-sales');
    const hasMonthlyTarget = useComponentPermission('monthly-target');
    const hasStatisticsChart = useComponentPermission('statistics-chart');
    const hasDemographicCard = useComponentPermission('demographic-card');
    const hasRecentOrders = useComponentPermission('recent-orders');

    return (
        <>
            <PageMeta
                title="Home | Creative Dashboard"
                description="Creative Dashboard - Manage your creative projects and campaigns"
            />
            <div className="grid grid-cols-12 gap-4 md:gap-6">
                {(hasEcommerceMetrics || hasMonthlySales) && (
                    <div className="col-span-12 space-y-6 xl:col-span-7">
                        {hasEcommerceMetrics && <EcommerceMetrics />}
                        {hasMonthlySales && <MonthlySalesChart />}
                    </div>
                )}

                {hasMonthlyTarget && (
                    <div className="col-span-12 xl:col-span-5">
                        <MonthlyTarget />
                    </div>
                )}

                {hasStatisticsChart && (
                    <div className="col-span-12">
                        <StatisticsChart />
                    </div>
                )}

                {hasDemographicCard && (
                    <div className="col-span-12 xl:col-span-5">
                        <DemographicCard />
                    </div>
                )}

                {hasRecentOrders && (
                    <div className="col-span-12 xl:col-span-7">
                        <RecentOrders />
                    </div>
                )}
            </div>
        </>
    );
}
