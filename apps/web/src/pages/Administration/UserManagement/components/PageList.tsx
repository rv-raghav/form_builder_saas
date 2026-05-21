import React, { memo, useMemo } from 'react';
import { PageOverridePermission } from './types';
import PageListItem from './PageListItem';
import Input from '../../../../components/form/input/InputField';

interface PageListProps {
    pages: PageOverridePermission[];
    selectedSlug: string | null;
    onSelectPage: (slug: string) => void;
    searchTerm: string;
    onSearchChange: (value: string) => void;
}

// Group pages by category - preserves insertion order
const groupByCategory = (
    pages: PageOverridePermission[]
): Map<string, PageOverridePermission[]> => {
    const map = new Map<string, PageOverridePermission[]>();
    for (const page of pages) {
        const cat = page.category || 'Other';
        if (!map.has(cat)) {
            map.set(cat, []);
        }
        map.get(cat)!.push(page);
    }
    return map;
};

// Format category names
const formatCategoryName = (category: string): string =>
    category
        .split(/[-_.]/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

const PageList: React.FC<PageListProps> = memo(
    ({ pages, selectedSlug, onSelectPage, searchTerm, onSearchChange }) => {
        // Filter pages by search term
        const filteredPages = useMemo(() => {
            if (!searchTerm.trim()) return pages;
            const term = searchTerm.toLowerCase();
            return pages.filter(
                (page) =>
                    page.name.toLowerCase().includes(term) ||
                    page.slug.toLowerCase().includes(term) ||
                    page.components.some(
                        (c) =>
                            c.name.toLowerCase().includes(term) ||
                            c.slug.toLowerCase().includes(term)
                    )
            );
        }, [pages, searchTerm]);

        const groupedPages = useMemo(() => groupByCategory(filteredPages), [filteredPages]);
        const orderedCategories = useMemo(() => Array.from(groupedPages.keys()), [groupedPages]);

        return (
            <div className="h-full flex flex-col">
                {/* Search */}
                <div className="flex-shrink-0 p-3 border-b border-gray-200 dark:border-gray-700">
                    <Input
                        type="text"
                        placeholder="Search pages..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="!h-9 !text-sm"
                    />
                </div>

                {/* Page List */}
                <div className="flex-1 overflow-y-auto p-2">
                    {filteredPages.length === 0 ? (
                        <div className="p-4 text-center text-gray-400 dark:text-gray-500 text-sm">
                            {searchTerm ? 'No pages match your search' : 'No pages available'}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orderedCategories.map((category) => (
                                <div key={category}>
                                    {/* Category Header */}
                                    <h4 className="px-3 mb-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                        {formatCategoryName(category)}
                                    </h4>
                                    {/* Pages in Category */}
                                    <div className="space-y-1">
                                        {groupedPages.get(category)?.map((page) => (
                                            <PageListItem
                                                key={page.slug}
                                                page={page}
                                                isSelected={selectedSlug === page.slug}
                                                onClick={() => onSelectPage(page.slug)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }
);

PageList.displayName = 'PageList';

export default PageList;
