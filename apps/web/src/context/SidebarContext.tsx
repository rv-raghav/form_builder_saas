import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

type SidebarContextType = {
    isExpanded: boolean;
    isMobileOpen: boolean;
    isHovered: boolean;
    activeItem: string | null;
    openSubmenu: string | null;
    toggleSidebar: () => void;
    toggleMobileSidebar: () => void;
    setIsHovered: (isHovered: boolean) => void;
    setActiveItem: (item: string | null) => void;
    toggleSubmenu: (item: string) => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
};

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [activeItem, setActiveItem] = useState<string | null>(null);
    const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

    // Debounced resize handler to prevent excessive re-renders
    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>;

        const handleResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                const mobile = window.innerWidth < 768;
                setIsMobile(mobile);
                if (!mobile) {
                    setIsMobileOpen(false);
                }
            }, 100);
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Memoized callback functions to prevent unnecessary re-renders
    const toggleSidebar = useCallback(() => {
        setIsExpanded((prev) => !prev);
    }, []);

    const toggleMobileSidebar = useCallback(() => {
        setIsMobileOpen((prev) => !prev);
    }, []);

    const toggleSubmenu = useCallback((item: string) => {
        setOpenSubmenu((prev) => (prev === item ? null : item));
    }, []);

    const handleSetIsHovered = useCallback((hovered: boolean) => {
        setIsHovered(hovered);
    }, []);

    const handleSetActiveItem = useCallback((item: string | null) => {
        setActiveItem(item);
    }, []);

    // Memoized context value to prevent consumer re-renders
    const value = useMemo(
        () => ({
            isExpanded: isMobile ? false : isExpanded,
            isMobileOpen,
            isHovered,
            activeItem,
            openSubmenu,
            toggleSidebar,
            toggleMobileSidebar,
            setIsHovered: handleSetIsHovered,
            setActiveItem: handleSetActiveItem,
            toggleSubmenu,
        }),
        [
            isMobile,
            isExpanded,
            isMobileOpen,
            isHovered,
            activeItem,
            openSubmenu,
            toggleSidebar,
            toggleMobileSidebar,
            handleSetIsHovered,
            handleSetActiveItem,
            toggleSubmenu,
        ]
    );

    return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
};
