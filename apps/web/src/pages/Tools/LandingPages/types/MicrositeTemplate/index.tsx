// src/pages/Tools/LandingPages/components/MicrositeTemplateForm.tsx
import { useState, useEffect, useCallback } from 'react';
import { Modal } from '../../../../../components/ui/modal';
import Button from '../../../../../components/ui/button/Button';
import { useToast } from '../../../../../context/ToastContext';
import { CloseIcon } from '../../../../../icons';
import {
    Brand,
    Campaign,
    MicrositeConfig,
    getDefaultMicrositeConfig,
    getLandingPage,
    createLandingPage,
    updateLandingPage,
    createBrand,
    createCampaign,
    getCampaigns,
    fileToBase64,
} from '../../../../../api/landingPages';

import BasicInfoSection from './components/BasicInfoSection';
import ThemeSection from './components/ThemeSection';
import LogoSection from './components/LogoSection';
import TopTextSection from './components/TopTextSection';
import CtaButtonsSection from './components/CtaButtonsSection';
import ProductSection from './components/ProductSection';

interface Props {
    editingId: number | null;
    brands: Brand[];
    campaigns: Campaign[];
    onClose: () => void;
    onRefreshBrands: (brand: Brand) => void;
}

// Validation pattern
const URL_PATTERN = /^https?:\/\/.+/;

export default function MicrositeTemplateForm({
    editingId,
    brands,
    campaigns: initialCampaigns,
    onClose,
    onRefreshBrands,
}: Props) {
    const [loading, setLoading] = useState(editingId !== null);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const { showToast } = useToast();

    // Form state
    const [name, setName] = useState('');
    const [selectedBrand, setSelectedBrand] = useState<string>('');
    const [selectedCampaign, setSelectedCampaign] = useState<string>('');
    const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
    const [config, setConfig] = useState<MicrositeConfig>(getDefaultMicrositeConfig());

    // Load existing data for editing
    useEffect(() => {
        if (editingId) {
            getLandingPage(editingId)
                .then((lp) => {
                    setName(lp.name);
                    // Cast config to MicrositeConfig
                    setConfig(lp.config as unknown as MicrositeConfig);
                    setSelectedCampaign(String(lp.campaign));
                    const campaign = initialCampaigns.find((c) => c.id === lp.campaign);
                    if (campaign) {
                        setSelectedBrand(String(campaign.brand));
                    }
                    setLoading(false);
                })
                .catch((err) => {
                    console.error('Failed to load landing page:', err);
                    showToast('Failed to load landing page', 'error');
                    setLoading(false);
                });
        }
    }, [editingId, initialCampaigns, showToast]);

    // Load campaigns when brand changes
    useEffect(() => {
        if (selectedBrand) {
            getCampaigns(Number(selectedBrand)).then(setCampaigns).catch(console.error);
        } else {
            setCampaigns(initialCampaigns);
        }
    }, [selectedBrand, initialCampaigns]);

    const updateConfig = useCallback((path: string, value: unknown) => {
        setConfig((prev) => {
            const newConfig = JSON.parse(JSON.stringify(prev)) as MicrositeConfig;
            const keys = path.split('.');
            let current: Record<string, unknown> = newConfig as unknown as Record<string, unknown>;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]] as Record<string, unknown>;
            }
            current[keys[keys.length - 1]] = value;
            return newConfig;
        });
        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[path];
            return newErrors;
        });
    }, []);

    const handleImageUpload = async (
        file: File,
        callback: (base64: string, filename: string) => void
    ) => {
        try {
            const base64 = await fileToBase64(file);
            // Get filename without extension for cleaner naming
            const filename = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
            callback(base64, filename);
        } catch (err) {
            console.error('Failed to process image:', err);
            showToast('Failed to process image', 'error');
        }
    };

    const handleCreateBrand = async (newBrandName: string) => {
        if (!newBrandName.trim()) return;
        try {
            const brand = await createBrand({ name: newBrandName.trim() });
            onRefreshBrands(brand);
            setSelectedBrand(String(brand.id));
            showToast(`Brand "${newBrandName}" created`, 'success');
        } catch (err) {
            console.error('Failed to create brand:', err);
            showToast('Failed to create brand', 'error');
            throw err;
        }
    };

    const handleCreateCampaign = async (newCampaignName: string) => {
        if (!newCampaignName.trim() || !selectedBrand) return;
        try {
            const campaign = await createCampaign({
                brand: Number(selectedBrand),
                name: newCampaignName.trim(),
            });
            setCampaigns((prev) => [...prev, campaign]);
            setSelectedCampaign(String(campaign.id));
            showToast(`Campaign "${newCampaignName}" created`, 'success');
        } catch (err) {
            console.error('Failed to create campaign:', err);
            showToast('Failed to create campaign', 'error');
            throw err;
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!name.trim()) newErrors.name = 'Name is required';
        if (!selectedCampaign) newErrors.campaign = 'Campaign is required';
        if (!config.logo.url) newErrors['logo.url'] = 'Logo is required';

        // Validate CTA buttons
        config.cta_buttons.forEach((btn, index) => {
            if (!btn.target_url) {
                newErrors[`cta_buttons.${index}.target_url`] = 'URL is required';
            } else if (!URL_PATTERN.test(btn.target_url)) {
                newErrors[`cta_buttons.${index}.target_url`] = 'Invalid URL';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            showToast('Please fix the validation errors', 'error');
            return;
        }

        setSaving(true);
        try {
            if (editingId) {
                await updateLandingPage(editingId, {
                    name: name.trim(),
                    config: config as unknown as import('../../../../../api/landingPages').LandingPageConfig,
                });
                showToast('Landing page updated successfully', 'success');
            } else {
                await createLandingPage({
                    campaign: Number(selectedCampaign),
                    name: name.trim(),
                    config: config as unknown as import('../../../../../api/landingPages').LandingPageConfig,
                    lp_type: 'microsite',
                });
                showToast('Landing page created successfully', 'success');
            }
            onClose();
        } catch (err) {
            console.error('Failed to save:', err);
            showToast('Failed to save landing page', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Options
    const brandOptions = brands.map((b) => ({ value: b.id, label: b.name }));
    const campaignOptions = campaigns
        .filter((c) => !selectedBrand || c.brand === Number(selectedBrand))
        .map((c) => ({ value: c.id, label: c.name }));

    if (loading) {
        return (
            <Modal isOpen={true} onClose={onClose} showCloseButton={false} className="max-w-md">
                <div className="p-8 flex justify-center">
                    <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </Modal>
        );
    }

    return (
        <Modal isOpen={true} onClose={onClose} showCloseButton={false} className="max-w-4xl">
            <div className="max-h-[85vh] flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {editingId ? 'Edit Microsite' : 'Create Microsite'}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        
                        <BasicInfoSection
                            name={name}
                            onNameChange={(val) => {
                                setName(val);
                                setErrors((prev) => ({ ...prev, name: '' }));
                            }}
                            selectedBrand={selectedBrand}
                            onBrandChange={setSelectedBrand}
                            selectedCampaign={selectedCampaign}
                            onCampaignChange={(val) => {
                                setSelectedCampaign(val);
                                setErrors((prev) => ({ ...prev, campaign: '' }));
                            }}
                            brandOptions={brandOptions}
                            campaignOptions={campaignOptions}
                            editingId={editingId}
                            errors={errors}
                            onCreateBrand={handleCreateBrand}
                            onCreateCampaign={handleCreateCampaign}
                        />

                        <ThemeSection config={config} updateConfig={updateConfig} />

                        <LogoSection 
                            config={config} 
                            updateConfig={updateConfig} 
                            onImageUpload={handleImageUpload} 
                            errors={errors} 
                        />

                        <TopTextSection config={config} updateConfig={updateConfig} />

                        <CtaButtonsSection 
                            buttons={config.cta_buttons} 
                            onButtonsChange={(newButtons) => updateConfig('cta_buttons', newButtons)} 
                            onImageUpload={handleImageUpload}
                            errors={errors}
                        />

                        <ProductSection config={config} updateConfig={updateConfig} onImageUpload={handleImageUpload} />

                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end items-center shrink-0 bg-white dark:bg-gray-900">
                        <div className="flex gap-3">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary" disabled={saving}>
                                {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Microsite'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
