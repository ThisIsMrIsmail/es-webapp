import { EyeIcon, EyeOffIcon } from "lucide-react";
import React, { memo, useCallback, useState } from "react";
import { FiSettings } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { accountService } from "../services/accountService";
import { removeCookie } from "../utils/cookieUtils";

// Extracted form validation logic
const PASSWORD_REGEX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Memoized password visibility toggle button
const VisibilityToggle = memo(({ show, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className="absolute end-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
        aria-label={show ? "Hide password" : "Show password"}
    >
        {show ? (
            <EyeOffIcon className="h-5 w-5" />
        ) : (
            <EyeIcon className="h-5 w-5" />
        )}
    </button>
));

// Move PasswordInput outside and memoize it
const PasswordInput = memo(
    ({
        name,
        label,
        value,
        onChange,
        showPassword,
        onToggleVisibility,
        error,
    }) => (
        <div className=" mb-5">
            <div className="flex items-center relative">
                <input
                    type={showPassword ? "text" : "password"}
                    value={value}
                    onChange={onChange}
                    className={`w-full px-4 py-2 rounded-lg border ${error ? "border-red-500" : "border-gray-300"
                        } focus:outline-none focus:ring-1 focus:ring-blue-300 pe-12`}
                    placeholder={label}
                />
                <VisibilityToggle show={showPassword} onClick={onToggleVisibility} />
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    )
);

// Main component using modern React patterns
const ChangePassword = ({ onSuccess, isFirstTime = false }) => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.dir() === "rtl";

    // Split password states
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        oldPassword: false,
        newPassword: false,
        confirmPassword: false,
    });

    // Create memoized toggle handlers
    const toggleOldPassword = useCallback(() => {
        setShowPasswords((prev) => ({
            ...prev,
            oldPassword: !prev.oldPassword,
        }));
    }, []);

    const toggleNewPassword = useCallback(() => {
        setShowPasswords((prev) => ({
            ...prev,
            newPassword: !prev.newPassword,
        }));
    }, []);

    const toggleConfirmPassword = useCallback(() => {
        setShowPasswords((prev) => ({
            ...prev,
            confirmPassword: !prev.confirmPassword,
        }));
    }, []);

    // Create memoized change handlers
    const handleOldPasswordChange = useCallback((e) => {
        setOldPassword(e.target.value);
    }, []);

    const handleNewPasswordChange = useCallback((e) => {
        setNewPassword(e.target.value);
    }, []);

    const handleConfirmPasswordChange = useCallback((e) => {
        setConfirmPassword(e.target.value);
    }, []);

    // Update validateForm to use individual states
    const validateForm = useCallback(() => {
        const newErrors = {};

        if (!oldPassword) {
            newErrors.oldPassword = isRTL ? "كلمة المرور الحالية مطلوبة" : "Current password is required";
        }

        if (!newPassword) {
            newErrors.newPassword = isRTL ? "كلمة المرور الجديدة مطلوبة" : "New password is required";
        } else if (!PASSWORD_REGEX.test(newPassword)) {
            newErrors.newPassword =
                isRTL ? "يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل، وحرف كبير، وحرف صغير، ورقم، وحرف خاص" : "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character";
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = isRTL ? "يرجى تأكيد كلمة المرور الجديدة" : "Please confirm your new password";
        } else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = isRTL ? "كلمات المرور غير متطابقة" : "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [oldPassword, newPassword, confirmPassword, isRTL]);

    // Update handleSubmit
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            await accountService.changePassword({
                oldPassword,
                newPassword,
            })

            // reset all password states
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
            onSuccess?.();
        } catch (error) {
            console.error("Password change failed:", error);
            setErrors({ submit: isRTL ? "فشل تغيير كلمة المرور. يرجى المحاولة مرة أخرى." : "Failed to change password. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`bg-blue-50 -ms-1 flex flex-col h-[calc(100vh-69px)]`}
            dir={isRTL ? "rtl" : "ltr"}
        >
            <div className="sticky top-0 bg-white px-4 py-3 border-b border-gray-300 rounded-t-lg">
                <div className="select-none flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FiSettings className="w-6 h-6 text-gray-600" />
                        <h1 className="text-2xl font-bold ">{t("general.Settings")}</h1>
                    </div>
                </div>
            </div>

            <div className={`max-w-[400px] mx-auto mt-10 p-3 pt-6 md:p-6 lg:p-6 bg-white rounded-xl shadow-lg ${isRTL ? "rtl" : "ltr"}`} >
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    {isFirstTime
                        ? t("changePassword.firstTimeTitle")
                        : t("changePassword.title")}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <PasswordInput
                        name="oldPassword"
                        label={t("changePassword.currentPassword")}
                        value={oldPassword}
                        onChange={handleOldPasswordChange}
                        showPassword={showPasswords.oldPassword}
                        onToggleVisibility={toggleOldPassword}
                        error={errors.oldPassword && t(errors.oldPassword)}
                    />
                    <PasswordInput
                        name="newPassword"
                        label={t("changePassword.newPassword")}
                        value={newPassword}
                        onChange={handleNewPasswordChange}
                        showPassword={showPasswords.newPassword}
                        onToggleVisibility={toggleNewPassword}
                        error={errors.newPassword && t(errors.newPassword)}
                    />
                    <PasswordInput
                        name="confirmPassword"
                        label={t("changePassword.confirmPassword")}
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        showPassword={showPasswords.confirmPassword}
                        onToggleVisibility={toggleConfirmPassword}
                        error={errors.confirmPassword && t(errors.confirmPassword)}
                    />

                    {errors.submit && (
                        <p className="text-red-500 text-sm mb-4"> {t("changePassword.submitError2")} </p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200
                   disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="none"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                {t("changePassword.changingPassword")}
                            </span>
                        ) : (
                            t("changePassword.changePasswordButton")
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
