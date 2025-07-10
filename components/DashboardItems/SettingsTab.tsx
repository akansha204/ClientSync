'use client'

import React, { useState, useEffect } from 'react'
import { Save, User, Shield, Database, Eye, EyeOff, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { StatsCard } from '@/components/ui/stats-card'
import useSupabaseSession from '@/hooks/useSupabaseSession'
import { DashboardService } from '@/lib/dashboardService'

interface UserProfile {
    id: string;
    email: string;
    full_name?: string;
    company?: string;
    phone?: string;
    bio?: string;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
}

interface AccountStats {
    totalClients: number;
    activeClients: number;
    activeTasks: number;
    completedTasks: number;
}

export default function SettingsTab() {
    const session = useSupabaseSession()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false)
    const [isClearTasksOpen, setIsClearTasksOpen] = useState(false)
    const [isCleanupClientsOpen, setIsCleanupClientsOpen] = useState(false)

    // Profile state
    const [profile, setProfile] = useState<UserProfile>({
        id: '',
        email: '',
        full_name: '',
        company: '',
        phone: '',
        bio: '',
        avatar_url: '',
        created_at: '',
        updated_at: ''
    })

    // Password state
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    // Account stats state
    const [accountStats, setAccountStats] = useState<AccountStats>({
        totalClients: 0,
        activeClients: 0,
        activeTasks: 0,
        completedTasks: 0
    })

    useEffect(() => {
        if (session?.user?.id) {
            loadUserProfile()
            loadAccountStats()
        }
    }, [session])

    const loadUserProfile = async () => {
        try {
            const profileData = await DashboardService.getUserProfile(session!.user.id)
            if (profileData) {
                setProfile(profileData)
            }
        } catch (error) {
            console.error('Error loading profile:', error)
        } finally {
            setLoading(false)
        }
    }

    const loadAccountStats = async () => {
        try {
            const [clients, tasks] = await Promise.all([
                DashboardService.getAllClients(session!.user.id),
                DashboardService.getAllTasks(session!.user.id)
            ])

            const activeClients = clients.filter((c: any) => c.status === 'active')
            const activeTasks = tasks.filter((t: any) => !t.is_completed)
            const completedTasks = tasks.filter((t: any) => t.is_completed)

            setAccountStats({
                totalClients: clients.length,
                activeClients: activeClients.length,
                activeTasks: activeTasks.length,
                completedTasks: completedTasks.length
            })
        } catch (error) {
            console.error('Error loading account stats:', error)
        }
    }

    const handleProfileUpdate = async () => {
        if (!session?.user?.id) return

        setSaving(true)
        try {
            await DashboardService.updateUserProfile(session.user.id, {
                full_name: profile.full_name,
                company: profile.company,
                phone: profile.phone,
                bio: profile.bio,
                avatar_url: profile.avatar_url
            })
            console.log('Profile updated successfully')
        } catch (error) {
            console.error('Error updating profile:', error)
        } finally {
            setSaving(false)
        }
    }

    const handlePasswordUpdate = async () => {
        if (!session?.user?.id) return

        if (passwords.newPassword !== passwords.confirmPassword) {
            console.error('Passwords do not match')
            return
        }

        setSaving(true)
        try {
            await DashboardService.updatePassword(session.user.id, passwords.newPassword)
            setPasswords({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            })
            console.log('Password updated successfully')
        } catch (error) {
            console.error('Error updating password:', error)
        } finally {
            setSaving(false)
        }
    }

    const handleDeleteAccount = async () => {
        if (!session?.user?.id) return

        try {
            await DashboardService.deleteUserAccount(session.user.id)
            console.log('Account deleted successfully')
            // The user will be redirected by the auth state change
        } catch (error) {
            console.error('Error deleting account:', error)
        }
        setIsDeleteAccountOpen(false)
    }

    const handleClearCompletedTasks = async () => {
        if (!session?.user?.id) return

        try {
            await DashboardService.clearCompletedTasks(session.user.id)
            await loadAccountStats() // Refresh stats
            console.log('Completed tasks cleared successfully')
        } catch (error) {
            console.error('Error clearing completed tasks:', error)
        }
        setIsClearTasksOpen(false)
    }

    const handleCleanupInactiveClients = async () => {
        if (!session?.user?.id) return

        try {
            await DashboardService.cleanupInactiveClients(session.user.id)
            await loadAccountStats() // Refresh stats
            console.log('Inactive clients cleaned up successfully')
        } catch (error) {
            console.error('Error cleaning up inactive clients:', error)
        }
        setIsCleanupClientsOpen(false)
    }

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your account settings and preferences.
                </p>
            </div>

            <Tabs defaultValue="account" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="data">Data</TabsTrigger>
                </TabsList>

                <TabsContent value="account" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Profile Information
                            </CardTitle>
                            <CardDescription>
                                Update your account details and personal information.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="w-20 h-20">
                                    <AvatarImage src={profile.avatar_url} />
                                    <AvatarFallback>
                                        {profile.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Camera className="w-4 h-4" />
                                    Change Photo
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="full_name">Full Name</Label>
                                    <Input
                                        id="full_name"
                                        value={profile.full_name || ''}
                                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                        placeholder="Enter your full name"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        value={profile.email}
                                        disabled
                                        className="bg-muted"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="company">Company</Label>
                                    <Input
                                        id="company"
                                        value={profile.company || ''}
                                        onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                                        placeholder="Your company name"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        value={profile.phone || ''}
                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                        placeholder="Your phone number"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea
                                    id="bio"
                                    value={profile.bio || ''}
                                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                    placeholder="Tell us about yourself"
                                    rows={3}
                                />
                            </div>

                            <Button onClick={handleProfileUpdate} disabled={saving} className="gap-2">
                                <Save className="w-4 h-4" />
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="w-5 h-5" />
                                Password & Security
                            </CardTitle>
                            <CardDescription>
                                Update your password and manage security settings.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current_password">Current Password</Label>
                                <div className="relative">
                                    <Input
                                        id="current_password"
                                        type={showPassword ? "text" : "password"}
                                        value={passwords.currentPassword}
                                        onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                        placeholder="Enter current password"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="new_password">New Password</Label>
                                <Input
                                    id="new_password"
                                    type={showPassword ? "text" : "password"}
                                    value={passwords.newPassword}
                                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                    placeholder="Enter new password"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirm_password">Confirm New Password</Label>
                                <Input
                                    id="confirm_password"
                                    type={showPassword ? "text" : "password"}
                                    value={passwords.confirmPassword}
                                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                    placeholder="Confirm new password"
                                />
                            </div>

                            <Button onClick={handlePasswordUpdate} disabled={saving} className="gap-2">
                                <Save className="w-4 h-4" />
                                {saving ? 'Updating...' : 'Update Password'}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-red-200">
                        <CardHeader>
                            <CardTitle className="text-red-600 flex items-center gap-2">
                                <Shield className="w-5 h-5" />
                                Danger Zone
                            </CardTitle>
                            <CardDescription>
                                Irreversible and destructive actions.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-red-800 mb-1">Delete Account</h4>
                                        <p className="text-sm text-red-600 mb-3">
                                            Permanently delete your account and all associated data including clients, tasks, and settings.
                                            This action cannot be undone.
                                        </p>
                                        <Dialog open={isDeleteAccountOpen} onOpenChange={setIsDeleteAccountOpen}>
                                            <DialogTrigger asChild>
                                                <Button variant="destructive" size="sm">
                                                    Delete Account
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-md">
                                                <DialogHeader>
                                                    <DialogTitle className="text-red-600">Delete Account</DialogTitle>
                                                    <DialogDescription className="text-gray-600">
                                                        Are you absolutely sure you want to delete your account? This will:
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="py-4">
                                                    <ul className="space-y-2 text-sm text-gray-600">
                                                        <li className="flex items-center gap-2">
                                                            <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                                                            Permanently delete all your clients
                                                        </li>
                                                        <li className="flex items-center gap-2">
                                                            <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                                                            Remove all tasks and follow-ups
                                                        </li>
                                                        <li className="flex items-center gap-2">
                                                            <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                                                            Erase your profile and settings
                                                        </li>
                                                        <li className="flex items-center gap-2">
                                                            <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                                                            Cancel your account permanently
                                                        </li>
                                                    </ul>
                                                    <div className="mt-4 p-3 bg-red-50 rounded-md border border-red-200">
                                                        <p className="text-sm font-medium text-red-800">
                                                            This action cannot be undone!
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" onClick={() => setIsDeleteAccountOpen(false)}>
                                                        Cancel
                                                    </Button>
                                                    <Button variant="destructive" onClick={handleDeleteAccount}>
                                                        Yes, Delete My Account
                                                    </Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="data" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Database className="w-5 h-5" />
                                Data Management
                            </CardTitle>
                            <CardDescription>
                                Manage your data and account preferences.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Cleanup Actions</h4>
                                    <div className="space-y-2">
                                        <Dialog open={isClearTasksOpen} onOpenChange={setIsClearTasksOpen}>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" className="w-full justify-start">
                                                    Clear Completed Tasks
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Clear Completed Tasks</DialogTitle>
                                                    <DialogDescription>
                                                        This will permanently delete all completed tasks. This action cannot be undone.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" onClick={() => setIsClearTasksOpen(false)}>
                                                        Cancel
                                                    </Button>
                                                    <Button variant="destructive" onClick={handleClearCompletedTasks}>
                                                        Clear Tasks
                                                    </Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>

                                        <Dialog open={isCleanupClientsOpen} onOpenChange={setIsCleanupClientsOpen}>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" className="w-full justify-start">
                                                    Cleanup Inactive Clients
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Cleanup Inactive Clients</DialogTitle>
                                                    <DialogDescription>
                                                        This will remove clients that have been inactive for more than 30 days along with their associated tasks. This action cannot be undone.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" onClick={() => setIsCleanupClientsOpen(false)}>
                                                        Cancel
                                                    </Button>
                                                    <Button variant="destructive" onClick={handleCleanupInactiveClients}>
                                                        Cleanup Clients
                                                    </Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>

                                <Separator />

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Account Statistics</CardTitle>
                                        <CardDescription>
                                            Overview of your account activity and usage.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <StatsCard
                                                title="Total Clients"
                                                value={accountStats.totalClients}
                                                description="All time"
                                            />
                                            <StatsCard
                                                title="Active Clients"
                                                value={accountStats.activeClients}
                                                description="Currently active"
                                            />
                                            <StatsCard
                                                title="Active Tasks"
                                                value={accountStats.activeTasks}
                                                description="In progress"
                                            />
                                            <StatsCard
                                                title="Completed Tasks"
                                                value={accountStats.completedTasks}
                                                description="All time"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
