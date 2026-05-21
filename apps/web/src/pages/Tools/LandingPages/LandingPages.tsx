// src/pages/Tools/LandingPages/LandingPages.tsx
import { useState, useEffect, useCallback } from 'react';
import PageBreadcrumb from '../../../components/common/PageBreadCrumb';
import PageMeta from '../../../components/common/PageMeta';
import Button from '../../../components/ui/button/Button';
import { Modal } from '../../../components/ui/modal';
import { useToast } from '../../../context/ToastContext';
import { PlusIcon } from '../../../icons';
import {
    getBrands,
    getCampaigns,
    getLandingPage,
    LandingPageListItem,
    Brand,
    Campaign,
    LP_TYPES,
    LPType,
} from '../../../api/landingPages';
import AddToCalendarForm from './types/AddToCalendar';
import MicrositeTemplateForm from './types/MicrositeTemplate';
import LandingPagesDataTable from './components/LandingPagesDataTable';

export default function LandingPages() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    // Modal states
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [selectedLpType, setSelectedLpType] = useState<LPType | null>(null);
    
    // Type selector modal
    const [showTypeSelector, setShowTypeSelector] = useState(false);

    // Refresh key to trigger DataTable reload
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchInitialData = useCallback(async () => {
        try {
            setLoading(true);
            const [brandsData, campaignsData] = await Promise.all([
                getBrands(),
                getCampaigns(),
            ]);
            setBrands(brandsData);
            setCampaigns(campaignsData);
        } catch (err) {
            console.error('Failed to load data:', err);
            showToast('Failed to load brands and campaigns', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    // Add a new brand to the list without full refresh (prevents form reset)
    const addBrand = useCallback((brand: Brand) => {
        setBrands((prev) => [...prev, brand]);
    }, []);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const handleCreate = () => {
        // Show type selector for new pages
        setShowTypeSelector(true);
    };
    
    const handleSelectType = (type: LPType) => {
        setSelectedLpType(type);
        setShowTypeSelector(false);
        setEditingId(null);
        setShowForm(true);
    };

    const handleEdit = async (lp: LandingPageListItem) => {
        // Load full LP to get its type
        try {
            const fullLp = await getLandingPage(lp.id);
            setSelectedLpType(fullLp.lp_type as LPType);
            setEditingId(lp.id);
            setShowForm(true);
        } catch (err) {
            console.error('Failed to load landing page:', err);
            showToast('Failed to load landing page', 'error');
        }
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditingId(null);
        setRefreshKey(prev => prev + 1); // Trigger DataTable refresh
    };

    const handleDataRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    if (loading) {
        return (
            <div>
                <PageMeta
                    title="Landing Pages | Creative Dashboard"
                    description="Create and manage event landing pages"
                />
                <PageBreadcrumb pageTitle="Landing Pages" />
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <PageMeta
                title="Landing Pages | Creative Dashboard"
                description="Create and manage event landing pages"
            />
            <PageBreadcrumb pageTitle="Landing Pages" />

            <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
                {/* Header */}
                <header className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                            Landing Pages
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Create and manage event landing pages
                        </p>
                    </div>
                    <Button variant="primary" onClick={handleCreate} startIcon={<PlusIcon className="w-5 h-5" />}>
                        Create Landing Page
                    </Button>
                </header>

                {/* DataTable */}
                <LandingPagesDataTable
                    key={refreshKey}
                    onEdit={handleEdit}
                    onRefresh={handleDataRefresh}
                />
            </div>

            {/* LP Type Selector Modal */}
            <Modal
                isOpen={showTypeSelector}
                onClose={() => setShowTypeSelector(false)}
                className="max-w-md"
            >
                <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                        Select Landing Page Type
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        Choose the type of landing page you want to create
                    </p>
                    <div className="space-y-3">
                        {(Object.entries(LP_TYPES) as [LPType, string][]).map(([key, label]) => (
                            <button
                                key={key}
                                onClick={() => handleSelectType(key)}
                                className="w-full p-4 text-left rounded-lg border border-gray-200 dark:border-gray-700 
                                         hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 
                                         transition-colors group"
                            >
                                <div className="font-medium text-gray-800 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400">
                                    {label}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {key === 'add_to_calendar' && 'Create an event landing page with calendar integration'}
                                    {key === 'microsite' && 'Create a microsite for e-commerce partners'}
                                </div>
                            </button>
                        ))}
                    </div>
                    <div className="mt-6 flex justify-end">
                        <Button variant="outline" onClick={() => setShowTypeSelector(false)}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Form Modal */}
            {showForm && selectedLpType === 'microsite' && (
                <MicrositeTemplateForm
                    editingId={editingId}
                    brands={brands}
                    campaigns={campaigns}
                    onClose={handleFormClose}
                    onRefreshBrands={addBrand}
                />
            )}
            {showForm && selectedLpType !== 'microsite' && (
                <AddToCalendarForm
                    editingId={editingId}
                    lpType={selectedLpType}
                    brands={brands}
                    campaigns={campaigns}
                    onClose={handleFormClose}
                    onRefreshBrands={addBrand}
                />
            )}
        </div>
    );
}
