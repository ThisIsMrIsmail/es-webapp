import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";


function DeleteConfirmationModal({
    confirmModal,
    setConfirmModal,
    handleConversationDelete,
    handleDraftDelete,
    handleConversationDeletePermanently,
    handleDeleteMessage,
}) {
    const modalRef = useRef(null);
    const { t } = useTranslation();

    useEffect(() => {
        // Handle escape key
        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setConfirmModal({ open: false });
            }
        };

        // Handle click outside
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setConfirmModal({ open: false });
            }
        };

        // Add event listeners
        document.addEventListener("keydown", handleEscape);
        document.addEventListener("mousedown", handleClickOutside);

        // Clean up
        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [setConfirmModal]);

    if (!confirmModal.open) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div
                ref={modalRef}
                className="bg-white rounded-xl p-6 max-w-sm w-full mx-4"
            >
                <h3 className="text-lg font-semibold mb-4">
                    {
                        confirmModal.type === "draft"
                            ? t("email.deletePermanentlyTitle")
                            : confirmModal.type === "conversation"
                                ? t("email.deleteConversationTitle")
                                : t("email.deleteMessageTitle")
                    }
                </h3>
                <p className="mb-4 text-gray-600">
                    {
                        confirmModal.type === "draft"
                            ? t("email.deletePermanentlyConfirmation")
                            : confirmModal.type === "conversation"
                                ? t("email.deleteConversationConfirmation")
                                : t("email.deleteMessageConfirmation")
                    }
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => setConfirmModal({ open: false })}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg"
                    >
                        {t("email.cancel")}
                    </button>
                    <button
                        onClick={() => {
                            if (confirmModal.type === "conversation") {
                                handleConversationDelete();
                            } else if (confirmModal.type === "draft") {
                                handleDraftDelete();
                            } else if (confirmModal.type === "permanent_delete") {
                                handleConversationDeletePermanently();
                            } else {
                                handleDeleteMessage(confirmModal.type);
                            }
                            setConfirmModal({ open: false });
                        }}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                        {t("email.delete")}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DeleteConfirmationModal;
