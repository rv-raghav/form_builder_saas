import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router';

// Assume these icons are imported from an icon library
import {
    ChevronDownIcon,
    GridIcon,
    HorizontaLDots,
    BoxCubeIcon,
    InboxIcon,
    PlugInIcon,
    UsersIcon,
} from '../icons';
import { useSidebar } from '../context/SidebarContext';
import { useAuth } from '../context/AuthContext';

type NavItem = {
    name: string;
    icon: React.ReactNode;
    path?: string;
    pageSlug?: string; // Maps to backend page slug for permission checking
    subItems?: { name: string; path: string; pageSlug?: string; pro?: boolean; new?: boolean }[];
};

// All available nav items - will be filtered based on user permissions
const allNavItems: NavItem[] = [
    {
        icon: <GridIcon />,
        name: 'Dashboard',
        path: '/dashboard',
        pageSlug: 'dashboard',
    },
    {
        icon: <BoxCubeIcon />,
        name: 'Forms',
        path: '/forms',
        pageSlug: 'forms',
    },
    {
        icon: <InboxIcon />,
        name: 'Submissions',
        path: '/submissions',
        pageSlug: 'submissions',
    },
    {
        icon: <PlugInIcon />,
        name: 'Explore',
        path: '/explore',
        pageSlug: 'explore',
    },
    {
        icon: <UsersIcon />,
        name: 'Administration',
        subItems: [
            { name: 'User Management', path: '/user-management', pageSlug: 'user-management' },
            { name: 'Access Control', path: '/access-control', pageSlug: 'access-control' },
        ],
    },
];
const othersItems: NavItem[] = [];

const AppSidebar: React.FC = () => {
    const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
    const { user } = useAuth();
    const location = useLocation();

    const [openSubmenu, setOpenSubmenu] = useState<{
        type: 'main' | 'others';
        index: number;
    } | null>(null);
    const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
    const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const navItems = useMemo(() => {
        // SuperAdmin gets all nav items regardless of allowed_pages
        if (user?.is_superadmin === true) {
            return allNavItems;
        }

        if (!user?.allowed_pages || user.allowed_pages.length === 0) {
            return [];
        }

        const allowedSlugs = new Set(user.allowed_pages.map((p) => p.slug));

        return allNavItems
            .filter((item) => {
                // Items without pageSlug are always visible (e.g., User Profile)
                if (!item.pageSlug && !item.subItems) {
                    return true;
                }
                // Check if main item's page slug is allowed
                if (item.pageSlug && allowedSlugs.has(item.pageSlug)) {
                    return true;
                }
                // For items with subItems, check if any subItem is allowed
                if (item.subItems) {
                    const hasAllowedSubItem = item.subItems.some(
                        (sub) => sub.pageSlug && allowedSlugs.has(sub.pageSlug)
                    );
                    return hasAllowedSubItem;
                }
                return false;
            })
            .map((item) => {
                // Filter subItems too
                if (item.subItems) {
                    return {
                        ...item,
                        subItems: item.subItems.filter(
                            (sub) => !sub.pageSlug || allowedSlugs.has(sub.pageSlug)
                        ),
                    };
                }
                return item;
            });
    }, [user?.allowed_pages, user?.is_superadmin]);

    // const isActive = (path: string) => location.pathname === path;
    const isActive = useCallback((path: string) => location.pathname === path, [location.pathname]);

    useEffect(() => {
        let submenuMatched = false;
        ['main', 'others'].forEach((menuType) => {
            const items = menuType === 'main' ? navItems : othersItems;
            items.forEach((nav, index) => {
                if (nav.subItems) {
                    nav.subItems.forEach((subItem) => {
                        if (isActive(subItem.path)) {
                            setOpenSubmenu({
                                type: menuType as 'main' | 'others',
                                index,
                            });
                            submenuMatched = true;
                        }
                    });
                }
            });
        });

        if (!submenuMatched) {
            setOpenSubmenu(null);
        }
    }, [location, isActive, navItems]);

    useEffect(() => {
        if (openSubmenu !== null) {
            const key = `${openSubmenu.type}-${openSubmenu.index}`;
            if (subMenuRefs.current[key]) {
                setSubMenuHeight((prevHeights) => ({
                    ...prevHeights,
                    [key]: subMenuRefs.current[key]?.scrollHeight || 0,
                }));
            }
        }
    }, [openSubmenu]);

    const handleSubmenuToggle = (index: number, menuType: 'main' | 'others') => {
        setOpenSubmenu((prevOpenSubmenu) => {
            if (
                prevOpenSubmenu &&
                prevOpenSubmenu.type === menuType &&
                prevOpenSubmenu.index === index
            ) {
                return null;
            }
            return { type: menuType, index };
        });
    };

    const renderMenuItems = (items: NavItem[], menuType: 'main' | 'others') => (
        <ul className="flex flex-col gap-4">
            {items.map((nav, index) => (
                <li key={nav.name}>
                    {nav.subItems ? (
                        <button
                            onClick={() => handleSubmenuToggle(index, menuType)}
                            className={`menu-item group ${
                                openSubmenu?.type === menuType && openSubmenu?.index === index
                                    ? 'menu-item-active'
                                    : 'menu-item-inactive'
                            } cursor-pointer ${
                                !isExpanded && !isHovered ? 'lg:justify-center' : 'lg:justify-start'
                            }`}
                        >
                            <span
                                className={`menu-item-icon-size  ${
                                    openSubmenu?.type === menuType && openSubmenu?.index === index
                                        ? 'menu-item-icon-active'
                                        : 'menu-item-icon-inactive'
                                }`}
                            >
                                {nav.icon}
                            </span>
                            {(isExpanded || isHovered || isMobileOpen) && (
                                <span className="menu-item-text">{nav.name}</span>
                            )}
                            {(isExpanded || isHovered || isMobileOpen) && (
                                <ChevronDownIcon
                                    className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                                        openSubmenu?.type === menuType &&
                                        openSubmenu?.index === index
                                            ? 'rotate-180 text-brand-500'
                                            : ''
                                    }`}
                                />
                            )}
                        </button>
                    ) : (
                        nav.path && (
                            <Link
                                to={nav.path}
                                className={`menu-item group ${
                                    isActive(nav.path) ? 'menu-item-active' : 'menu-item-inactive'
                                }`}
                            >
                                <span
                                    className={`menu-item-icon-size ${
                                        isActive(nav.path)
                                            ? 'menu-item-icon-active'
                                            : 'menu-item-icon-inactive'
                                    }`}
                                >
                                    {nav.icon}
                                </span>
                                {(isExpanded || isHovered || isMobileOpen) && (
                                    <span className="menu-item-text">{nav.name}</span>
                                )}
                            </Link>
                        )
                    )}
                    {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
                        <div
                            ref={(el) => {
                                subMenuRefs.current[`${menuType}-${index}`] = el;
                            }}
                            className="overflow-hidden transition-all duration-300"
                            style={{
                                height:
                                    openSubmenu?.type === menuType && openSubmenu?.index === index
                                        ? `${subMenuHeight[`${menuType}-${index}`]}px`
                                        : '0px',
                            }}
                        >
                            <ul className="mt-2 space-y-1 ml-9">
                                {nav.subItems.map((subItem) => (
                                    <li key={subItem.name}>
                                        <Link
                                            to={subItem.path}
                                            className={`menu-dropdown-item ${
                                                isActive(subItem.path)
                                                    ? 'menu-dropdown-item-active'
                                                    : 'menu-dropdown-item-inactive'
                                            }`}
                                        >
                                            {subItem.name}
                                            <span className="flex items-center gap-1 ml-auto">
                                                {subItem.new && (
                                                    <span
                                                        className={`ml-auto ${
                                                            isActive(subItem.path)
                                                                ? 'menu-dropdown-badge-active'
                                                                : 'menu-dropdown-badge-inactive'
                                                        } menu-dropdown-badge`}
                                                    >
                                                        new
                                                    </span>
                                                )}
                                                {subItem.pro && (
                                                    <span
                                                        className={`ml-auto ${
                                                            isActive(subItem.path)
                                                                ? 'menu-dropdown-badge-active'
                                                                : 'menu-dropdown-badge-inactive'
                                                        } menu-dropdown-badge`}
                                                    >
                                                        pro
                                                    </span>
                                                )}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </li>
            ))}
        </ul>
    );

    return (
        <aside
            className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen ? 'w-[290px]' : isHovered ? 'w-[290px]' : 'w-[90px]'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0`}
            onMouseEnter={() => !isExpanded && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className={`py-8 flex ${
                    !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start'
                }`}
            >
                <Link to="/">
                    {isExpanded || isHovered || isMobileOpen ? (
                        <>
                            <img
                                className="dark:hidden"
                                src="/assets/logo/logo.svg"
                                alt="Logo"
                                width={150}
                                height={40}
                            />
                            <img
                                className="hidden dark:block"
                                src="/assets/logo/logo-dark.svg"
                                alt="Logo"
                                width={150}
                                height={40}
                            />
                        </>
                    ) : (
                        <img src="/favicon.png" alt="Logo" width={32} height={32} />
                    )}
                </Link>
            </div>
            <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
                <nav className="mb-6">
                    <div className="flex flex-col gap-4">
                        <div>
                            <h2
                                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                                    !isExpanded && !isHovered
                                        ? 'lg:justify-center'
                                        : 'justify-start'
                                }`}
                            >
                                {isExpanded || isHovered || isMobileOpen ? (
                                    'Menu'
                                ) : (
                                    <HorizontaLDots className="size-6" />
                                )}
                            </h2>
                            {renderMenuItems(navItems, 'main')}
                        </div>
                    </div>
                </nav>
            </div>
        </aside>
    );
};

export default AppSidebar;
