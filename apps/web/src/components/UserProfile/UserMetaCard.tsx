import { useModal } from '../../hooks/useModal';
import { Modal } from '../ui/modal';
import Button from '../ui/button/Button';
import Input from '../form/input/InputField';
import Label from '../form/Label';
import { useAuth } from '../../context/AuthContext';
import { PencilIcon } from '../../icons';
import { getInitials, getRandomColor } from '../../utils/avatarUtils';

export default function UserMetaCard() {
    const { isOpen, openModal, closeModal } = useModal();
    const { user } = useAuth();

    const handleSave = () => {
        // Handle save logic here
        closeModal();
    };

    // Construct full name from first_name and last_name, fallback to name or username
    const fullName =
        user?.first_name && user?.last_name
            ? `${user.first_name} ${user.last_name}`
            : user?.name || user?.username || 'User';

    const displayRole =
        user?.role && user.role.length > 0
            ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
            : 'User';

    // Generate initials avatar (same logic as header)
    const nameForInitials = user?.first_name || user?.last_name
        ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
        : user?.name || user?.username || 'User';
    
    const initials = getInitials(nameForInitials);
    const backgroundColor = getRandomColor(nameForInitials);

    return (
        <>
            <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
                        <div
                            className="w-20 h-20 overflow-hidden rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-sm"
                            style={{ backgroundColor }}
                        >
                            {initials}
                        </div>
                        <div className="order-3 xl:order-2">
                            <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                                {fullName}
                            </h4>
                            <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {displayRole}
                                </p>
                                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Gurugram, India
                                </p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={openModal}
                        className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
                    >
                        <PencilIcon className="w-4.5 h-4.5 fill-current" />
                        Edit
                    </button>
                </div>
            </div>
            <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
                <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                    <div className="px-2 pr-14">
                        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                            Edit Personal Information
                        </h4>
                        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                            Update your details to keep your profile up-to-date.
                        </p>
                    </div>
                    <form className="flex flex-col">
                        <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
                            <div>
                                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                                    Personal Information
                                </h5>

                                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                                    <div className="col-span-2 lg:col-span-1">
                                        <Label>First Name</Label>
                                        <Input
                                            type="text"
                                            value={user?.first_name || ''}
                                            readOnly
                                        />
                                    </div>

                                    <div className="col-span-2 lg:col-span-1">
                                        <Label>Last Name</Label>
                                        <Input type="text" value={user?.last_name || ''} readOnly />
                                    </div>

                                    <div className="col-span-2 lg:col-span-1">
                                        <Label>Email Address</Label>
                                        <Input type="text" value={user?.email || ''} readOnly />
                                    </div>

                                    <div className="col-span-2 lg:col-span-1">
                                        <Label>Phone</Label>
                                        <Input type="text" value="" placeholder="-" readOnly />
                                    </div>

                                    <div className="col-span-2">
                                        <Label>Bio</Label>
                                        <Input type="text" value={displayRole} readOnly />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                            <Button size="sm" variant="outline" onClick={closeModal}>
                                Close
                            </Button>
                            <Button size="sm" onClick={handleSave}>
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </>
    );
}
