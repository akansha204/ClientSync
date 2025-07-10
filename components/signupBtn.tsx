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

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccessMessage("");

        try {
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
            });

            if (error) {
                setError(error.message);
                return;
            }

            if (data.user && !data.user.email_confirmed_at) {
                setSuccessMessage("Check your email to verify your account!");
            } else {
                setSuccessMessage("Account created successfully!");
                setTimeout(() => {
                    setDialogOpen(false);
                    resetForm();
                    router.push('/userDashboard');
                }, 2000);
            }
        } catch (error) {
            setError("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger
                onClick={() => setDialogOpen(true)}
                className="bg-black hover:cursor-pointer text-white px-3 py-2 rounded-lg font-normal text-base transition-all duration-200 sm:text-base sm:px-3 sm:py-2"
            >
                Start for free
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
                        Create your account
                    </DialogTitle>
                    <DialogDescription className="text-center text-gray-600">
                        Get started with ClientSync and manage your clients efficiently
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSignup} className="space-y-4 mt-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    {successMessage && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-700 text-sm">{successMessage}</p>
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-500"
                            placeholder="your@email.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-500"
                            placeholder="Create a strong password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Creating account..." : "Create account"}
                    </button>
                </form>

                <div className="text-center">
                    <span className="text-gray-600 text-sm">
                        Already have an account?{" "}
                        <button
                            onClick={handleLoginClick}
                            className="text-blue-600 hover:text-blue-700 underline"
                        >
                            Sign in
                        </button>
                    </span>
                </div>
            </DialogContent>
        </Dialog>
    );
}