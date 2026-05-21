// Creative Types - Shared across the application

export interface CreativeSize {
    size: string; // e.g., "300x250"
    url: string; // Full URL to the iframe
}

export interface CreativeVariant {
    variantKey: string; // e.g., "standard", "split-cube"
    variantLabel: string; // e.g., "Standard", "Split Cube"
    sizes: CreativeSize[];
}

export interface Creative {
    id: string;
    key: string;
    label: string;
    type: 'DISPLAY' | 'CTV' | 'OLV';
    description?: string;
    variants: CreativeVariant[]; // Multiple variants (e.g., Standard 3D Cube, Split Cube)
}
