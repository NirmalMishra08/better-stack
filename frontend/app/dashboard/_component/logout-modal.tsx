type LogoutModal = {
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
}

const LogoutModal = ({ isOpen, onClose, onLogout }: LogoutModal) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
                <h2 className="text-xl font-bold text-gray-900">Confirm Logout</h2>
                <p className="mt-2 text-gray-600">Are you sure you want to log out of your account?</p>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="rounded-md px-4 py-2 text-gray-600 hover:bg-gray-100 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onLogout}
                        className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 transition"
                    >
                        Log Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LogoutModal