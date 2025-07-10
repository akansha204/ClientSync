"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import supabase from "@/lib/supabaseClient";

interface LoginBtnProps {
    onSignupClick?: () => void;
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export default function LoginBtn({ onSignupClick, isOpen, onOpenChange }: LoginBtnProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isResetMode, setIsResetMode] = useState(false);
    const [resetEmailSent, setResetEmailSent] = useState(false);
    const [internalOpen, setInternalOpen] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [resetEmail, setResetEmail] = useState("");

    // Use external state if provided, otherwise use internal state
    const dialogOpen = isOpen !== undefined ? isOpen : internalOpen;
    const setDialogOpen = onOpenChange || setInternalOpen;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password
            });

            if (error) {
                throw error;
            }

            if (data?.user) {
                // Close dialog and redirect to dashboard after successful login
                setDialogOpen(false);
                router.push('/userDashboard');
            }
        } catch (error: any) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };



    const [resetError, setResetError] = useState("");

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resetEmail) {
            setResetError('Please enter your email address');
            return;
        }

        setIsLoading(true);
        setResetError("");
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
                redirectTo: `${window.location.origin}/auth/reset-password`
            });

            if (error) {
                throw error;
            }

            setResetEmailSent(true);
        } catch (error: any) {
            setResetError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setIsResetMode(false);
        setResetEmailSent(false);
        setResetEmail("");
        setResetError("");
        setFormData({ email: "", password: "" });
        setError("");
    };

    const handleSignupClick = () => {
        setDialogOpen(false);
        resetForm();
        onSignupClick?.();
    };

    return (
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger
                onClick={() => setDialogOpen(true)}
                className="bg-white hover:bg-gray-50 hover:cursor-pointer text-gray-700 px-3 py-2 rounded-lg font-normal text-md transition-all duration-200  hover:border-gray-400 sm:text-base sm:px-4 sm:py-2"
            >
                Log in
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white text-black border-gray-200">
                <DialogHeader>
                    <div className="flex items-center gap-2 justify-center mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">C</span>
                        </div>
                        <span className="text-lg font-semibold text-black">ClientSync</span>
                    </div>
                    <DialogTitle className="text-2xl font-bold text-center text-black">
                        {isResetMode ? 'Reset Password' : 'Welcome back'}
                    </DialogTitle>
                    <DialogDescription className="text-center text-gray-600">
                        {isResetMode
                            ? 'Enter your email to receive a password reset link'
                            : 'Sign in to your ClientSync account to manage your clients'
                        }
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    {resetEmailSent ? (
                        <div className="text-center space-y-4">
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-green-700">
                                    Password reset email sent! Check your inbox for further instructions.
                                </p>
                            </div>
                            <button
                                onClick={() => resetForm()}
                                className="w-full text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Back to Login
                            </button>
                        </div>
                    ) : isResetMode ? (
                        <form onSubmit={handleForgotPassword} className="space-y-4">
                            {resetError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-700 text-sm">{resetError}</p>
                                </div>
                            )}
                            <div>
                                <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="resetEmail"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-500"
                                    placeholder="Enter your email"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Sending..." : "Send Reset Email"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsResetMode(false)}
                                className="w-full text-gray-600 hover:text-gray-800 font-medium"
                            >
                                Back to Login
                            </button>
                        </form>
                    ) : (
                        <>
                            {/* Error display for login */}
                            {error && !isResetMode && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-700 text-sm">{error}</p>
                                </div>
                            )}

                            {/* Email/Password Login Form */}
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-500"
                                        placeholder="m@example.com"
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label htmlFor="password" className="text-sm font-medium text-gray-700">
                                            Password
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setIsResetMode(true)}
                                            className="text-sm text-blue-600 hover:text-blue-700"
                                        >
                                            Forgot your password?
                                        </button>
                                    </div>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? "Logging in..." : "Login"}
                                </button>
                            </form>

                            {/* Sign up link */}
                            <div className="text-center">
                                <span className="text-gray-600 text-sm">
                                    Don't have an account?{" "}
                                    <button
                                        onClick={handleSignupClick}
                                        className="text-blue-600 hover:text-blue-700 underline"
                                    >
                                        Sign up
                                    </button>
                                </span>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
