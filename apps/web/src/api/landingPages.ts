// src/api/landingPages.ts
import { api } from './auth';
import { API_ENDPOINTS } from '../config/api';

// Types
export interface Brand {
    id: number;
    name: string;
    slug: string;
    description?: string;
    campaign_count: number;
    created_by?: number;
    created_by_username?: string;
    created_at: string;
    updated_at: string;
}

export interface Campaign {
    id: number;
    brand: number;
    brand_name: string;
    name: string;
    slug: string;
    description?: string;
    landing_page_count: number;
    created_by?: number;
    created_by_username?: string;
    created_at: string;
    updated_at: string;
}

export interface LandingPageConfig {
    meta: {
        pageTitle: string;
        robots: string;
        appleAppCapable: boolean;
    };
    branding: {
        organizer: string;
        eventTitle: string;
        eventTeaser: string;
    };
    event: {
        location: string;
        startDate: string;
        startTime: string;
        endDate: string;
        endTime: string;
        allDay: boolean;
        timezone: string;
        showCountdown: boolean;
    };
    cta: {
        type: number;
        url: string;
    };
    share: {
        url: string;
    };
}

// Microsite Config (for microsite landing page type)
export interface MicrositeConfig {
    theme: {
        background_color: string;
        container_color: string;
        color1: string;
        color2: string;
        product_image_color: string;
    };
    logo: {
        url: string;
        logo_height: string;
    };
    top_text: {
        title: string;
        description: string;
        text_color: string;
    };
    cta_buttons: Array<{
        title: string;
        target_url: string;
        image: string;
        image_name?: string;  // Original filename for image
    }>;
    cta_button_width: string;
    product_conf: {
        image: string;
        image_name?: string;  // Original filename for image
        title: string;
        desc: string;
        animation: boolean;
        animation_key: 'left' | 'right' | 'bottom';
    };
    // Logo original filename
    logo_name?: string;
}

export interface LandingPage {
    id: number;
    campaign: number;
    campaign_name: string;
    brand_name: string;
    brand_slug: string;
    name: string;
    slug: string;
    lp_type: 'add_to_calendar' | string;
    generator_version: string;
    config: LandingPageConfig;
    // Image paths in bucket/uploads/
    primary_image_path: string;
    welcome_image_path: string;
    // Staging/Production HTML paths
    staging_html_path: string;
    production_html_path: string;
    // URLs
    public_url: string | null;
    staging_url: string;
    production_url: string;
    // Status
    status: 'draft' | 'staging' | 'production';
    is_published: boolean;
    is_staging: boolean;
    staging_published_at: string | null;
    production_published_at: string | null;
    created_by?: number;
    created_by_username?: string;
    created_at: string;
    updated_at: string;
}

export interface LandingPageListItem {
    id: number;
    name: string;
    slug: string;
    campaign: number;
    campaign_name: string;
    brand_name: string;
    lp_type: 'add_to_calendar' | string;
    status: 'draft' | 'staging' | 'production';
    is_published: boolean;
    is_staging: boolean;
    public_url: string | null;
    staging_url: string;
    production_url: string;
    generator_version: string;
    primary_image_path: string;
    welcome_image_path: string;
    staging_html_path: string;
    production_html_path: string;
    staging_published_at: string | null;
    production_published_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface GeneratorVersion {
    id: number;
    version: string;
    description: string;
    is_active: boolean;
    is_default: boolean;
    created_at: string;
}

// CTA Type options for dropdown
export const CTA_TYPES: Record<number, string | null> = {
    0: null,       // No CTA
    1: 'Get Tickets',
    2: 'Book Now',
    3: 'Register',
    4: 'RSVP',
};

// API Response types
interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}



// Default config for new landing pages
export const getDefaultConfig = (): LandingPageConfig => ({
    meta: {
        pageTitle: 'Event Page',
        robots: 'noindex, nofollow',
        appleAppCapable: true,
    },
    branding: {
        organizer: '',
        eventTitle: '',
        eventTeaser: '',
    },
    event: {
        location: '',
        startDate: '',
        startTime: '00:00',
        endDate: '',
        endTime: '00:00',
        allDay: false,
        timezone: 'Asia/Kolkata',
        showCountdown: true,
    },
    cta: {
        type: 0,
        url: '',
    },
    share: {
        url: '',
    },
});

// Default config for microsite landing pages
export const getDefaultMicrositeConfig = (): MicrositeConfig => ({
    theme: {
        background_color: '#FFF2E5',
        container_color: '#FFF2E5',
        color1: '',
        color2: '',
        product_image_color: '#FFF2E5',
    },
    logo: {
        url: '',
        logo_height: '60px',
    },
    top_text: {
        title: '',
        description: '',
        text_color: '',
    },
    cta_buttons: [
        { title: '', target_url: '', image: '' },
        { title: '', target_url: '', image: '' },
    ],
    cta_button_width: '60%',
    product_conf: {
        image: '',
        title: '',
        desc: '',
        animation: true,
        animation_key: 'right',
    },
});

// Brand API
export async function getBrands(): Promise<Brand[]> {
    const response = await api.get<PaginatedResponse<Brand>>(API_ENDPOINTS.LANDING_PAGES.BRANDS);
    return response.data.results;
}

export async function createBrand(data: { name: string; description?: string }): Promise<Brand> {
    const response = await api.post<Brand>(API_ENDPOINTS.LANDING_PAGES.BRANDS, data);
    return response.data;
}

export async function getBrand(id: number): Promise<Brand> {
    const response = await api.get<Brand>(API_ENDPOINTS.LANDING_PAGES.BRAND_DETAIL(id));
    return response.data;
}

export async function updateBrand(id: number, data: Partial<Brand>): Promise<Brand> {
    const response = await api.patch<Brand>(API_ENDPOINTS.LANDING_PAGES.BRAND_DETAIL(id), data);
    return response.data;
}

export async function deleteBrand(id: number): Promise<void> {
    await api.delete(API_ENDPOINTS.LANDING_PAGES.BRAND_DETAIL(id));
}

// Campaign API
export async function getCampaigns(brandId?: number): Promise<Campaign[]> {
    const params = brandId ? { brand: brandId } : {};
    const response = await api.get<PaginatedResponse<Campaign>>(API_ENDPOINTS.LANDING_PAGES.CAMPAIGNS, { params });
    return response.data.results;
}

export async function createCampaign(data: { brand: number; name: string; description?: string }): Promise<Campaign> {
    const response = await api.post<Campaign>(API_ENDPOINTS.LANDING_PAGES.CAMPAIGNS, data);
    return response.data;
}

export async function getCampaign(id: number): Promise<Campaign> {
    const response = await api.get<Campaign>(API_ENDPOINTS.LANDING_PAGES.CAMPAIGN_DETAIL(id));
    return response.data;
}

export async function updateCampaign(id: number, data: Partial<Campaign>): Promise<Campaign> {
    const response = await api.patch<Campaign>(API_ENDPOINTS.LANDING_PAGES.CAMPAIGN_DETAIL(id), data);
    return response.data;
}

export async function deleteCampaign(id: number): Promise<void> {
    await api.delete(API_ENDPOINTS.LANDING_PAGES.CAMPAIGN_DETAIL(id));
}

// Landing Page API with DataTables support
export interface FetchLandingPagesParams {
    page?: number;
    pageSize?: number;
    search?: string;
    ordering?: string;
}

export interface FetchLandingPagesResponse {
    results: LandingPageListItem[];
    count: number;
    next: string | null;
    previous: string | null;
}

export async function fetchLandingPages(params: FetchLandingPagesParams = {}): Promise<FetchLandingPagesResponse> {
    try {
        const { page = 1, pageSize = 20, search = '', ordering = '-created_at' } = params;
        
        // Use standard DRF params instead of DataTables complexity
        const queryParams = {
            page,
            page_size: pageSize,
            search,
            ordering,
        };
        
        const response = await api.get(API_ENDPOINTS.LANDING_PAGES.LIST, {
            params: queryParams,
        });
        
        // Handle DataTables response format
        if (response.data && 'recordsTotal' in response.data) {
            return {
                results: response.data.data || [],
                count: response.data.recordsTotal || 0,
                next: null,
                previous: null,
            };
        }
        
        // Handle paginated response from DRF (fallback)
        if (response.data && Array.isArray(response.data.results)) {
            return {
                results: response.data.results,
                count: response.data.count || 0,
                next: response.data.next || null,
                previous: response.data.previous || null,
            };
        }
        
        // Handle direct array response
        if (Array.isArray(response.data)) {
            return {
                results: response.data,
                count: response.data.length,
                next: null,
                previous: null,
            };
        }
        
        console.error('Unexpected API response format:', response.data);
        return { results: [], count: 0, next: null, previous: null };
    } catch (error) {
        console.error('Error fetching landing pages:', error);
        throw new Error('Failed to fetch landing pages');
    }
}

// Legacy function for backwards compatibility
export async function getLandingPages(): Promise<LandingPageListItem[]> {
    const response = await fetchLandingPages();
    return response.results;
}

export async function createLandingPage(data: {
    campaign: number;
    name: string;
    config: LandingPageConfig;
    lp_type?: LPType;
    primary_image?: string;
    welcome_image?: string;
    generator_version?: string;
}): Promise<LandingPage> {
    const response = await api.post<LandingPage>(API_ENDPOINTS.LANDING_PAGES.LIST, data);
    return response.data;
}

export async function getLandingPage(id: number): Promise<LandingPage> {
    const response = await api.get<LandingPage>(API_ENDPOINTS.LANDING_PAGES.DETAIL(id));
    return response.data;
}

// Update payload - includes write-only fields for image upload
export interface LandingPageUpdateData {
    name?: string;
    campaign?: number;
    config?: LandingPageConfig;
    generator_version?: string;
    // Base64 images for upload (write-only, not returned in response)
    primary_image?: string;
    welcome_image?: string;
}

export async function updateLandingPage(id: number, data: LandingPageUpdateData): Promise<LandingPage> {
    const response = await api.patch<LandingPage>(API_ENDPOINTS.LANDING_PAGES.DETAIL(id), data);
    return response.data;
}

export async function deleteLandingPage(id: number): Promise<void> {
    await api.delete(API_ENDPOINTS.LANDING_PAGES.DETAIL(id));
}

// Preview & Publish
export async function previewLandingPage(id: number, data?: {
    config?: LandingPageConfig;
    primary_image?: string;
    welcome_image?: string;
}): Promise<{ html: string; generator_version: string }> {
    const response = await api.post(API_ENDPOINTS.LANDING_PAGES.PREVIEW(id), data || {});
    return response.data;
}

export async function previewNewLandingPage(data: {
    config: LandingPageConfig;
    primary_image?: string;
    welcome_image?: string;
    generator_version?: string;
}): Promise<{ html: string; generator_version: string }> {
    const response = await api.post(API_ENDPOINTS.LANDING_PAGES.PREVIEW_NEW, data);
    return response.data;
}

export async function publishLandingPage(id: number, regenerate = true): Promise<{
    message: string;
    staging_url: string;
    staging_html_path: string;
    staging_published_at: string;
    status: string;
}> {
    const response = await api.post(API_ENDPOINTS.LANDING_PAGES.PUBLISH(id), { regenerate });
    return response.data;
}

export async function createProdUrl(id: number): Promise<{
    message: string;
    production_url: string;
    production_html_path: string;
    production_published_at: string;
    status: string;
}> {
    const response = await api.post(`${API_ENDPOINTS.LANDING_PAGES.DETAIL(id)}create_prod_url/`);
    return response.data;
}

export async function purgeProdUrl(id: number): Promise<{
    message: string;
    production_url: string;
    staging_url: string;
    production_published_at: string;
    status: string;
}> {
    const response = await api.post(`${API_ENDPOINTS.LANDING_PAGES.DETAIL(id)}purge_prod_url/`);
    return response.data;
}

export async function unpublishLandingPage(id: number): Promise<{ message: string; status: string }> {
    const response = await api.post(API_ENDPOINTS.LANDING_PAGES.UNPUBLISH(id));
    return response.data;
}

// Generator Versions
export async function getGeneratorVersions(): Promise<GeneratorVersion[]> {
    const response = await api.get<PaginatedResponse<GeneratorVersion>>(API_ENDPOINTS.LANDING_PAGES.VERSIONS);
    return response.data.results;
}

// LP Types for type selector
export const LP_TYPES = {
    add_to_calendar: 'Add to Calendar',
    microsite: 'Microsite',
    calculator: 'Calculator',
} as const;

export type LPType = keyof typeof LP_TYPES;

// Utility: Convert file to base64
export function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
}
