import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for managing dropdown state with outside click detection.
 * Reduces boilerplate code across components that use dropdowns.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isOpen, toggle, close, dropdownRef } = useDropdown();
 *
 *   return (
 *     <div ref={dropdownRef}>
 *       <button onClick={toggle}>Toggle</button>
 *       {isOpen && <div>Dropdown content</div>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
    const close = useCallback(() => setIsOpen(false), []);
    const open = useCallback(() => setIsOpen(true), []);

    // Close on outside click
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen]);

    return { isOpen, toggle, close, open, dropdownRef };
}
