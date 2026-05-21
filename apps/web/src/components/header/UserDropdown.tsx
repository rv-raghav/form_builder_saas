import { useNavigate } from 'react-router-dom';
import { DropdownItem } from '../ui/dropdown/DropdownItem';
import { Dropdown } from '../ui/dropdown/Dropdown';
import { useAuth } from '../../context/AuthContext';
import { useDropdown } from '../../hooks/useDropdown';
import {
    UserEditIcon,
    InfoCircleIcon,
    LogoutIcon,
    ChevronDownIcon,
} from '../../icons';
import { getInitials, getRandomColor } from '../../utils/avatarUtils';

export default function UserDropdown() {
    // Use reusable dropdown hook
    const { isOpen, toggle: toggleDropdown, close: closeDropdown, dropdownRef } = useDropdown();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    async function handleLogout() {
        // Close dropdown first for better UX
        closeDropdown();

        // Clear auth state (calls server to blacklist token and clear cookies)
        await logout();

        // Reset theme to light mode
        localStorage.removeItem('theme');
        document.documentElement.classList.remove('dark');

        // Send user to login with cleared state
        navigate('/signin', { replace: true, state: null });
    }

    const displayName = user?.name || 'User';
    const displayEmail = user?.email || 'user@example.com';
    
    // Prioritize first/last name for initials to ensuring "Super Admin" -> "SA"
    const nameForInitials = user?.first_name || user?.last_name
        ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
        : user?.name || user?.username || 'User';

    const initials = getInitials(nameForInitials);
    const backgroundColor = getRandomColor(nameForInitials);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="flex items-center text-gray-700 dropdown-toggle dark:text-gray-400"
            >
                <span
                    className="mr-3 flex h-11 w-11 items-center justify-center overflow-hidden rounded-full font-medium text-white shadow-sm"
                    style={{ backgroundColor }}
                >
                    {initials}
                </span>

                <span className="block mr-1 font-medium text-theme-sm text-gray-700 dark:text-gray-200">
                    {displayName}
                </span>
                <ChevronDownIcon
                    className={`w-5 h-5 stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                />
            </button>

            <Dropdown
                isOpen={isOpen}
                onClose={closeDropdown}
                className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
            >
                <div>
                    <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-200">
                        {displayName}
                    </span>
                    <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
                        {displayEmail}
                    </span>
                </div>

                <ul className="flex flex-col gap-1 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800">
                    <li>
                        <DropdownItem
                            onItemClick={closeDropdown}
                            tag="a"
                            to="/profile"
                            className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                        >
                            <UserEditIcon className="w-6 h-6 fill-gray-500 group-hover:fill-gray-700 dark:fill-gray-400 dark:group-hover:fill-gray-300" />
                            Edit profile
                        </DropdownItem>
                    </li>

                    <li>
                        <DropdownItem
                            onItemClick={closeDropdown}
                            tag="a"
                            to="/profile"
                            className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                        >
                            <InfoCircleIcon className="w-6 h-6 fill-gray-500 group-hover:fill-gray-700 dark:fill-gray-400 dark:group-hover:fill-gray-300" />
                            Support
                        </DropdownItem>
                    </li>
                </ul>

                <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                >
                    <LogoutIcon className="w-6 h-6 fill-gray-500 group-hover:fill-gray-700 dark:group-hover:fill-gray-300" />
                    Sign out
                </button>
            </Dropdown>
        </div>
    );
}
