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

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError("");
        console.log('Starting Google login...');

        try {
            // Construct the callback URL more explicitly
            const redirectTo = `${window.location.origin}/auth/callback?next=/dashboard`;
            console.log('Redirect URL:', redirectTo);

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectTo,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    }
                }
            });

            console.log('Google OAuth response:', { data, error });

            if (error) {
                console.error('OAuth initiation error:', error);
                throw error;
            }

            // Note: For OAuth, the browser will redirect automatically
            // We don't set isLoading to false here because the page will redirect
        } catch (error: any) {
            console.error('Google login error:', error);
            setError(`Google login failed: ${error.message}`);
            setIsLoading(false);
        }
        // Don't set isLoading to false in finally block for OAuth
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
                className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
                Login
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-gray-900 text-white border-gray-700">
                <DialogHeader>
                    <div className="flex items-center gap-2 justify-center mb-2">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                            <span className="text-gray-900 font-bold text-sm">A</span>
                        </div>
                        <span className="text-lg font-semibold">Acme Inc.</span>
                    </div>
                    <DialogTitle className="text-2xl font-bold text-center">
                        {isResetMode ? 'Reset Password' : 'Welcome back'}
                    </DialogTitle>
                    <DialogDescription className="text-center text-gray-400">
                        {isResetMode
                            ? 'Enter your email to receive a password reset link'
                            : 'Login with your Google account'
                        }
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    {resetEmailSent ? (
                        <div className="text-center space-y-4">
                            <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
                                <p className="text-green-400">
                                    Password reset email sent! Check your inbox for further instructions.
                                </p>
                            </div>
                            <button
                                onClick={() => resetForm()}
                                className="w-full text-blue-400 hover:text-blue-300 font-medium"
                            >
                                Back to Login
                            </button>
                        </div>
                    ) : isResetMode ? (
                        <form onSubmit={handleForgotPassword} className="space-y-4">
                            {resetError && (
                                <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg">
                                    <p className="text-red-400 text-sm">{resetError}</p>
                                </div>
                            )}
                            <div>
                                <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-300 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="resetEmail"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
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
                                className="w-full text-gray-400 hover:text-gray-300 font-medium"
                            >
                                Back to Login
                            </button>
                        </form>
                    ) : (
                        <>
                            {/* Error display for Google OAuth */}
                            {error && !isResetMode && (
                                <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg">
                                    <p className="text-red-400 text-sm">{error}</p>
                                </div>
                            )}

                            {/* Google Login Button */}
                            <button
                                onClick={handleGoogleLogin}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-3 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                {isLoading ? "Loading..." : "Login with Google"}
                            </button>

                            {/* Divider */}
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-gray-600" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-gray-900 text-gray-400">Or continue with</span>
                                </div>
                            </div>

                            {/* Email/Password Login Form */}
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                                        placeholder="m@example.com"
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label htmlFor="password" className="text-sm font-medium text-gray-300">
                                            Password
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setIsResetMode(true)}
                                            className="text-sm text-blue-400 hover:text-blue-300"
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
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? "Logging in..." : "Login"}
                                </button>
                            </form>

                            {/* Sign up link */}
                            <div className="text-center">
                                <span className="text-gray-400 text-sm">
                                    Don't have an account?{" "}
                                    <button
                                        onClick={handleSignupClick}
                                        className="text-blue-400 hover:text-blue-300 underline"
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
