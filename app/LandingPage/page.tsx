'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ArrowRight, BarChart3, Calendar, Users, Shield, CheckCircle, Star, Zap, Clock, Target, LogOut, LayoutDashboard, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import useSupabaseSession from "@/hooks/useSupabaseSession"
import supabase from "@/lib/supabaseClient"
import SignupBtn from "@/components/signupBtn"
import LoginBtn from "@/components/LoginBtn"
import { SimpleThemeToggle } from "@/components/simple-theme-toggle"
import { DynamicLogo } from "@/components/dynamic-logo"

export default function LandingPage() {
    const session = useSupabaseSession()
    const [isSignupOpen, setIsSignupOpen] = useState(false)
    const [isLoginOpen, setIsLoginOpen] = useState(false)

    const handleShowSignup = () => {
        setIsLoginOpen(false)
        setIsSignupOpen(true)
    }

    const handleShowLogin = () => {
        setIsSignupOpen(false)
        setIsLoginOpen(true)
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
    }

    const handleStartFreeTrial = () => {
        if (session) {
            // User is logged in, redirect to dashboard
            window.open('/userDashboard', '_blank')
        } else {
            // User is not logged in, show signup
            setIsSignupOpen(true)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            {/* Header */}
            <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 sticky top-0 z-50 border-rounded-lg">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-6xl">
                    <div className="flex items-center space-x-2">
                        <DynamicLogo />
                        <span className="text-xl font-bold bg-gradient-to-r text-black dark:text-white bg-clip-text hidden sm:block ">
                            ClientSync
                        </span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <SimpleThemeToggle />
                        {session ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={session.user?.user_metadata?.avatar_url} alt="User" />
                                            <AvatarFallback>
                                                <User className="h-8 w-8" />
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuItem onClick={() => window.open('/userDashboard', '_blank')}>
                                        <LayoutDashboard className="mr-2 h-4 w-4" />
                                        <span>Dashboard</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleLogout}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <>
                                <LoginBtn
                                    isOpen={isLoginOpen}
                                    onOpenChange={setIsLoginOpen}
                                    onSignupClick={handleShowSignup}
                                />
                                <SignupBtn
                                    isOpen={isSignupOpen}
                                    onOpenChange={setIsSignupOpen}
                                    onLoginClick={handleShowLogin}
                                />
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="py-20 px-4">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <Badge variant="secondary" className="px-3 py-1">
                                    <Star className="w-3 h-3 mr-1" />
                                    Client Management Made Simple
                                </Badge>
                                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                                    Sync Your{" "}
                                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                        Client Success
                                    </span>
                                </h1>
                                <p className="text-xl text-muted-foreground leading-relaxed">
                                    Transform your client relationships with our all-in-one platform.
                                    Manage tasks, track progress, and deliver exceptional results with ease.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    size="lg"
                                    className="text-base px-8 py-6 hover:cursor-pointer"
                                    onClick={handleStartFreeTrial}
                                >
                                    Start Free Trial
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </div>

                            <div className="flex items-center space-x-8 pt-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">500+</div>
                                    <div className="text-sm text-muted-foreground">Happy Clients</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-indigo-600">98%</div>
                                    <div className="text-sm text-muted-foreground">Success Rate</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">24/7</div>
                                    <div className="text-sm text-muted-foreground">Support</div>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-2xl blur-3xl opacity-20"></div>
                            <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-1">
                                <Image
                                    src="/ss1.png"
                                    alt="ClientSync Dashboard"
                                    width={600}
                                    height={400}
                                    className="rounded-xl w-full h-auto"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4 bg-white/50 dark:bg-slate-800/50">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center space-y-4 mb-16">
                        <Badge variant="secondary" className="px-3 py-1">
                            <Zap className="w-3 h-3 mr-1" />
                            Features
                        </Badge>
                        <h2 className="text-4xl font-bold">Everything you need to succeed</h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Powerful tools designed to streamline your client management workflow
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                            <CardHeader>
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-2">
                                    <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <CardTitle>Client Management</CardTitle>
                                <CardDescription>
                                    Organize and track all your client information in one central location
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card className="border-0 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
                            <CardHeader>
                                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-2">
                                    <Calendar className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <CardTitle>Task Scheduling</CardTitle>
                                <CardDescription>
                                    Plan, schedule, and track tasks with smart deadline management
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                            <CardHeader>
                                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-2">
                                    <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <CardTitle>Analytics Dashboard</CardTitle>
                                <CardDescription>
                                    Get insights into your performance with detailed analytics and reports
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                            <CardHeader>
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-2">
                                    <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                                <CardTitle>Secure & Private</CardTitle>
                                <CardDescription>
                                    Enterprise-grade security with end-to-end encryption for all data
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card className="border-0 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
                            <CardHeader>
                                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-2">
                                    <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                                </div>
                                <CardTitle>Time Tracking</CardTitle>
                                <CardDescription>
                                    Monitor time spent on projects and generate accurate billing reports
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card className="border-0 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20">
                            <CardHeader>
                                <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center mb-2">
                                    <Target className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                                </div>
                                <CardTitle>Goal Tracking</CardTitle>
                                <CardDescription>
                                    Set and track progress towards client objectives and business goals
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Task Management Preview Section */}
            <section className="py-20 px-4 bg-white/30 dark:bg-slate-800/30">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="relative order-2 lg:order-1">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl blur-3xl opacity-20"></div>
                            <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-1">
                                <Image
                                    src="/ss3.png"
                                    alt="ClientSync Task Management"
                                    width={600}
                                    height={400}
                                    className="rounded-xl w-full h-auto"
                                />
                            </div>
                        </div>
                        <div className="space-y-6 order-1 lg:order-2">
                            <h3 className="text-2xl font-bold">Smart Task Management</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Stay on top of your workflow with intelligent task scheduling and priority management.
                                Never miss a deadline and keep your clients happy with our advanced task tracking system.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-center space-x-3">
                                    <CheckCircle className="w-5 h-5 text-purple-500" />
                                    <span>Automated task prioritization</span>
                                </li>
                                <li className="flex items-center space-x-3">
                                    <CheckCircle className="w-5 h-5 text-purple-500" />
                                    <span>Deadline notifications and reminders</span>
                                </li>
                                <li className="flex items-center space-x-3">
                                    <CheckCircle className="w-5 h-5 text-purple-500" />
                                    <span>Progress tracking and reporting</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Screenshots Section */}
            <section className="py-20 px-4">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center space-y-4 mb-16">
                        <Badge variant="secondary" className="px-3 py-1">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Feature Showcase
                        </Badge>
                        <h2 className="text-4xl font-bold">Complete Client Management Suite</h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Discover the powerful features that make ClientSync your ultimate client management solution
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold">Advanced Feature Set</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Access a comprehensive suite of tools designed to streamline every aspect of your client relationships.
                                From contact management to project tracking, everything you need is at your fingertips.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-center space-x-3">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <span>Comprehensive client profiles</span>
                                </li>
                                <li className="flex items-center space-x-3">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <span>Advanced search and filtering</span>
                                </li>
                                <li className="flex items-center space-x-3">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <span>Customizable workflows</span>
                                </li>
                            </ul>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-400 rounded-2xl blur-3xl opacity-20"></div>
                            <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-1">
                                <Image
                                    src="/ss2.png"
                                    alt="ClientSync Features"
                                    width={600}
                                    height={400}
                                    className="rounded-xl w-full h-auto"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-600">
                <div className="container mx-auto max-w-4xl text-center">
                    <div className="space-y-8">
                        <h2 className="text-4xl lg:text-5xl font-bold text-white">
                            Ready to transform your client management?
                        </h2>
                        <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                            Join thousands of professionals who trust ClientSync to manage their client relationships effectively.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                size="lg"
                                variant="secondary"
                                className="text-base px-8 py-6 cursor-pointer"
                                onClick={handleStartFreeTrial}
                            >
                                Start Your Free Trial
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </div>
                        <p className="text-blue-200 text-sm">
                            No credit card required • Free to use • Cancel anytime
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-4 bg-slate-900 text-white">
                <div className="container mx-auto max-w-6xl">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center space-x-2 mb-4 md:mb-0">
                            <Image
                                src="/white logo.png"
                                alt="ClientSync Logo"
                                width={32}
                                height={32}
                                className="w-8 h-8"
                            />
                            <span className="text-xl font-bold">ClientSync</span>
                        </div>
                        <div className="flex space-x-6 text-sm text-slate-400">
                            <Link href="/#" className="hover:text-white transition-colors">Privacy Policy</Link>
                            <Link href="/#" className="hover:text-white transition-colors">Terms of Service</Link>
                            <Link href="/#" className="hover:text-white transition-colors">Support</Link>
                        </div>
                    </div>
                    <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400 text-sm">
                        © 2025 ClientSync. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    )
}