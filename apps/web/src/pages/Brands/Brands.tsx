import { useState } from 'react';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../components/ui/table';
import Badge from '../../components/ui/badge/Badge';
import Button from '../../components/ui/button/Button';
import { Modal } from '../../components/ui/modal';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Checkbox from '../../components/form/input/Checkbox';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import { useToast } from '../../context/ToastContext';

type CreativeTypeKey = 'DISPLAY_3D_CUBE' | 'DISPLAY_WOBBLE';

interface CreativeOption {
    key: CreativeTypeKey;
    label: string;
}

type BrandStatus = 'DRAFT' | 'IN_REVIEW' | 'APPROVED';

interface Brand {
    id: string;
    name: string;
    lastUpdated?: string;
    status: BrandStatus;
    selectedCreativeKeys: CreativeTypeKey[]; // creatives chosen for brand's sample page
}

// Available creatives for selection in the modal
const AVAILABLE_CREATIVE_OPTIONS: CreativeOption[] = [
    { key: 'DISPLAY_3D_CUBE', label: '3D Cube' },
    { key: 'DISPLAY_WOBBLE', label: 'Wobble' },
];

// Initial mocked brands
const INITIAL_BRANDS: Brand[] = [
    {
        id: '1',
        name: 'Surya Lighting',
        lastUpdated: '2025-11-20',
        status: 'DRAFT',
        selectedCreativeKeys: [],
    },
    {
        id: '2',
        name: 'BMW',
        lastUpdated: '2025-11-18',
        status: 'APPROVED',
        selectedCreativeKeys: ['DISPLAY_3D_CUBE'],
    },
];

function Brands() {
    const [brands, setBrands] = useState<Brand[]>(INITIAL_BRANDS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { showToast } = useToast();

    const handleOpenCreateCampaign = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleCreateBrandWithCampaign = (payload: {
        brandName: string;
        creativeKeys: CreativeTypeKey[];
    }) => {
        const now = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

        const newBrand: Brand = {
            id: String(Date.now()),
            name: payload.brandName.trim(),
            lastUpdated: now,
            status: 'IN_REVIEW',
            selectedCreativeKeys: payload.creativeKeys,
        };

        setBrands((prev) => [newBrand, ...prev]);
        setIsModalOpen(false);
        showToast(`Campaign created for ${payload.brandName}`, 'success');
    };

    const handleApproveBrand = (brandId: string) => {
        setBrands((prev) =>
            prev.map((b) =>
                b.id === brandId
                    ? {
                          ...b,
                          status: 'APPROVED',
                          lastUpdated: new Date().toISOString().slice(0, 10),
                      }
                    : b
            )
        );
        const brand = brands.find((b) => b.id === brandId);
        showToast(`${brand?.name || 'Brand'} approved successfully`, 'success');
    };

    return (
        <div>
            <PageMeta
                title="Brands | Creative Dashboard"
                description="Manage brands and set up sample campaigns using available creatives."
            />
            <PageBreadcrumb pageTitle="Brands" />

            <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
                <header className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                            Brands
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Manage brands and set up sample campaigns using available creatives.
                        </p>
                    </div>
                    <Button
                        type="button"
                        onClick={handleOpenCreateCampaign}
                        variant="primary"
                        size="md"
                    >
                        Create New Campaign
                    </Button>
                </header>

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <div className="max-w-full overflow-x-auto">
                        <Table>
                            {/* Table Header */}
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                    >
                                        Brand
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                    >
                                        Status
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                    >
                                        Creatives (Sample Page)
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                    >
                                        Last Updated
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
                                    >
                                        Actions
                                    </TableCell>
                                </TableRow>
                            </TableHeader>

                            {/* Table Body */}
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {brands.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="px-5 py-8 text-center text-gray-500 text-theme-sm dark:text-gray-400"
                                        >
                                            No brands found. Use "Create New Campaign" to add one.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    brands.map((brand) => (
                                        <TableRow key={brand.id}>
                                            <TableCell className="px-5 py-4 text-start">
                                                <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                    {brand.name}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-start">
                                                <StatusBadge status={brand.status} />
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                {brand.selectedCreativeKeys.length === 0
                                                    ? '—'
                                                    : brand.selectedCreativeKeys
                                                          .map(
                                                              (key) =>
                                                                  AVAILABLE_CREATIVE_OPTIONS.find(
                                                                      (opt) => opt.key === key
                                                                  )?.label ?? key
                                                          )
                                                          .join(', ')}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                {brand.lastUpdated ?? '—'}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-end">
                                                {brand.status === 'IN_REVIEW' ? (
                                                    <Button
                                                        variant="success"
                                                        size="sm"
                                                        onClick={() => handleApproveBrand(brand.id)}
                                                    >
                                                        Approve
                                                    </Button>
                                                ) : (
                                                    <span className="text-xs text-gray-400">—</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {isModalOpen && (
                    <CreateBrandAndCampaignModal
                        creativeOptions={AVAILABLE_CREATIVE_OPTIONS}
                        onClose={handleCloseModal}
                        onSubmit={handleCreateBrandWithCampaign}
                    />
                )}
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: BrandStatus }) {
    const badgeConfig = {
        DRAFT: { label: 'Draft', color: 'light' as const },
        IN_REVIEW: { label: 'In Review', color: 'warning' as const },
        APPROVED: { label: 'Approved', color: 'success' as const },
    };

    const config = badgeConfig[status];

    return (
        <Badge size="sm" color={config.color}>
            {config.label}
        </Badge>
    );
}

interface CreateBrandAndCampaignModalProps {
    creativeOptions: CreativeOption[];
    onClose: () => void;
    onSubmit: (payload: { brandName: string; creativeKeys: CreativeTypeKey[] }) => void;
}

function CreateBrandAndCampaignModal({
    creativeOptions,
    onClose,
    onSubmit,
}: CreateBrandAndCampaignModalProps) {
    const [brandName, setBrandName] = useState('');
    const [selectedCreativeKeys, setSelectedCreativeKeys] = useState<CreativeTypeKey[]>([
        'DISPLAY_3D_CUBE',
    ]); // default one selected

    const toggleCreativeSelection = (key: CreativeTypeKey) => {
        setSelectedCreativeKeys((prev) =>
            prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!brandName.trim()) return;
        if (selectedCreativeKeys.length === 0) return;

        onSubmit({
            brandName: brandName.trim(),
            creativeKeys: selectedCreativeKeys,
        });
    };

    return (
        <Modal isOpen={true} onClose={onClose} showCloseButton={false} className="max-w-lg p-0">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-lg font-semibold dark:text-white">Create New Campaign</h2>
                <button
                    type="button"
                    onClick={onClose}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xl leading-none"
                    aria-label="Close"
                >
                    ×
                </button>
            </div>

            <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
                <div>
                    <Label htmlFor="brandName">Brand Name</Label>
                    <Input
                        id="brandName"
                        type="text"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        placeholder="e.g. Surya Lighting"
                    />
                </div>

                <div className="space-y-2">
                    <Label>Creatives for Sample Page</Label>
                    <div className="space-y-2">
                        {creativeOptions.map((option) => (
                            <Checkbox
                                key={option.key}
                                id={option.key}
                                label={option.label}
                                checked={selectedCreativeKeys.includes(option.key)}
                                onChange={() => toggleCreativeSelection(option.key)}
                            />
                        ))}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        These creatives will be used to build the brand&apos;s sample showcase page.
                    </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        type="submit"
                        disabled={!brandName.trim() || selectedCreativeKeys.length === 0}
                    >
                        Create & Mark as In Review
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

export default Brands;
