import { AlertCircle, HelpCircle, Lock, User } from "lucide-react";
import React, { memo, useEffect, useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { authService } from "../../services/authService";
import { getCookie, setCookie } from "../../utils/cookieUtils";

import ChangePassword from "../ChangePassword";
import { WindowSharp } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

const LoginPage = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.dir() === "rtl";    

    // checking if user is already logged in.
    useEffect(() => {
        if (getCookie("token") && !getCookie("isFirstTimeCookie")) {
            navigate("/home/inbox", { replace: true });
        }
    }, [navigate]);

    const { isLoading, error, isLoggedIn } = useSelector(
        (state) =>
            state.auth || {
                isLoading: false,
                error: null,
                isLoggedIn: false,
            }
    );

    const [loginError, setLoginError] = useState(null);
    const [helpPopoverAnchor, setHelpPopoverAnchor] = useState(null);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data) => {
        try {
            setLoginError(null);

            const response = await authService.login(data);

            if (response.accessToken) {        
                document.getElementById("email").value = "";
                document.getElementById("password").value = "";
                setCookie("token", response.accessToken);
                if (data.password === response.nationalId) {
                    // loading the change password component below
                    // if the user is logging in for the first time
                    // or if the the national id is the password
                    navigate("/home/settings");
                } else {
                    navigate("/home/inbox");
                }
            }
        } catch (err) {
            const errorMessage =
                err?.response?.data?.message ||
                err?.message ||
                "Login failed. Please check your credentials.";
            setLoginError(errorMessage);
        }
    }

    const [show, setShow] = useState(false);

    const handleClick = () => {
        setShow(!show);
        const passwordField = document.getElementById("password");
        passwordField.type = show ? "password" : "text";
    }

    return (
        <div dir="ltr" className="min-h-screen flex items-center justify-center bg-gray-200">
            <div className="z-[999] bg-white border border-gray-300 rounded-none md:rounded-lg lg:rounded-lg max-w-sm md:max-w-md lg:max-w-md w-full flex flex-col md:flex-row">
                <div className="w-full p-6 items-center">
                    <div className="flex flex-col items-center">
                        <img src="/uni-logo.png" className="w-16 h-16 items-center justify-center mb-6" />
                        <h1 className="text-3xl font-bold mb-6 capitalize">Sign in</h1>
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="w-full space-y-6"
                        >
                            <div className="relative">
                                <Controller
                                    name="email"
                                    control={control}
                                    rules={{
                                        required: "Email is required",
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Invalid email format",
                                        },
                                    }}
                                    render={({ field }) => (
                                        <div>
                                            <div className="relative">
                                                <input
                                                    autoFocus
                                                    id="email"
                                                    type="text"
                                                    placeholder="your email"
                                                    className={`w-full px-3 py-2 focus:outline-none border ${errors.email ? "border-red-500" : "border-gray-300"
                                                        } rounded-lg ps-10`}
                                                    {...field}
                                                />
                                                <div className="absolute start-3 top-3 text-gray-400">
                                                    <User size={20} />
                                                </div>
                                                <div
                                                    className="absolute end-3 top-3 text-gray-400 cursor-pointer"
                                                    onMouseEnter={(e) =>setHelpPopoverAnchor(e.currentTarget)}
                                                    onMouseLeave={() => setHelpPopoverAnchor(null)}
                                                >
                                                    <HelpCircle size={20} />

                                                    {/* Help Popover */}
                                                    {helpPopoverAnchor && (
                                                        <div className="absolute mt-1 end-0 w-64 bg-white border border-gray-200 rounded-md shadow-lg p-4 z-10">
                                                            <h3 className="font-medium text-gray-900 mb-1">
                                                                Login Help
                                                            </h3>
                                                            <p className="text-sm text-gray-600">
                                                                If this is your first time logging in, please
                                                                use your National ID as your password. You will
                                                                be prompted to change your password after
                                                                successful login.
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {errors.email && (
                                                <p className="mt-1 text-red-500 text-sm">
                                                    {errors.email.message}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                />
                            </div>

                            <div className="relative">
                                <Controller
                                    name="password"
                                    control={control}
                                    rules={{
                                        required: "Password is required",
                                        minLength: {
                                            value: 6,
                                            message: "Password must be at least 6 characters",
                                        },
                                    }}
                                    render={({ field }) => (
                                        <div>
                                            <div className="relative">
                                                <input
                                                    id="password"
                                                    type="password"
                                                    placeholder="your password"
                                                    className={`w-full px-3 py-2 focus:outline-none border ${errors.password
                                                        ? "border-red-500"
                                                        : "border-gray-300"
                                                        } rounded-lg ps-10`}
                                                    {...field}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleClick}
                                                    className="absolute end-3 top-1/2 transform -translate-y-1/2 text-gray-400 focus:outline-none"
                                                    aria-label={show ? "Hide password" : "Show password"}
                                                >
                                                    {show ? (
                                                        <EyeOffIcon className="h-5 w-5" />
                                                    ) : (
                                                        <EyeIcon className="h-5 w-5" />
                                                    )}
                                                </button>
                                                <div className="absolute start-3 top-3 text-gray-400">
                                                    <Lock size={20} />
                                                </div>
                                            </div>
                                            {errors.password && (
                                                <p className="mt-1 text-red-500 text-sm">
                                                    {errors.password.message}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                />
                            </div>

                            {/* Error Messages */}
                            {(loginError || error) && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative flex items-center">
                                    <AlertCircle size={16} className="mr-2" />
                                    <span>{loginError || error}</span>
                                </div>
                            )}

                            <button
                                id="submit-button"
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium p-3 rounded-lg transition duration-200 flex justify-center"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <svg
                                        className="animate-spin h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4">
                                        </circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                        </path>
                                    </svg>
                                ) : (
                                    "Log in"
                                )}
                            </button>

                            <div>
                                <p className="text-center text-gray-500 text-sm">
                                    {t("general.loginHelp")}
                                </p>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
