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

interface SignupBtnProps {
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    onLoginClick?: () => void;
}

export default function SignupBtn({ isOpen, onOpenChange, onLoginClick }: SignupBtnProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [internalOpen, setInternalOpen] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    // Use external state if provided, otherwise use internal state
    const dialogOpen = isOpen !== undefined ? isOpen : internalOpen;
    const setDialogOpen = onOpenChange || setInternalOpen;

    const resetForm = () => {
        setFormData({ email: "", password: "" });
        setError("");
        setSuccessMessage("");
    };

    const handleLoginClick = () => {
        setDialogOpen(false);
        resetForm();
        onLoginClick?.();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleManualSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccessMessage("");

        try {
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password
            });

            if (error) {
                throw error;
            }

            if (data?.user) {
                if (data.user.email_confirmed_at) {
                    // User is immediately confirmed, redirect to dashboard
                    setDialogOpen(false);
                    router.push('/userDashboard');
                } else {
                    // User needs to confirm email
                    setSuccessMessage("Account created successfully! Please check your email to verify your account.");
                    setFormData({ email: "", password: "" });
                }
            }
        } catch (error: any) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        setIsLoading(true);
        setError("");
        setSuccessMessage("");
        console.log('Starting Google signup...');

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
            console.error('Google signup error:', error);
            setError(`Google signup failed: ${error.message}`);
            setIsLoading(false);
        }
        // Don't set isLoading to false in finally block for OAuth
    };

    return (
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                Sign Up
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">
                        Get started with ClientSync
                    </DialogTitle>
                    <DialogDescription className="text-center text-gray-600">
                        Create your account to start managing your clients efficiently
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    {/* Error display */}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Success message display */}
                    {successMessage && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-600 text-sm">{successMessage}</p>
                        </div>
                    )}

                    {/* Google OAuth Button */}
                    <button
                        onClick={handleGoogleSignup}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        {isLoading ? "Loading..." : "Continue with Google"}
                    </button>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    {/* Manual Signup Form */}
                    <form onSubmit={handleManualSignup} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter your email"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                                minLength={6}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Create a password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Creating Account..." : "Create Account"}
                        </button>
                    </form>

                    {/* Terms and Privacy */}
                    <p className="text-xs text-gray-500 text-center">
                        By signing up, you agree to our{" "}
                        <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>{" "}
                        and{" "}
                        <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                    </p>

                    {/* Login link */}
                    <div className="text-center">
                        <span className="text-gray-500 text-sm">
                            Already have an account?{" "}
                            <button
                                onClick={handleLoginClick}
                                className="text-blue-600 hover:text-blue-500 underline"
                            >
                                Login
                            </button>
                        </span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}