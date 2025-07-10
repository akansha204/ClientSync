"use client"
import React, { useState, useEffect } from 'react'
import { Save, User, Bell, Shield, Database, Eye, EyeOff, Upload, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
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

interface UserPreferences {
    id: string;
    user_id: string;
    email_notifications: boolean;
    task_reminders: boolean;
    weekly_digest: boolean;
    theme: 'light' | 'dark' | 'system';
    timezone: string;
    date_format: string;
    time_format: '12h' | '24h';
    created_at: string;
    updated_at: string;
}

export default function SettingsTab() {
    const session = useSupabaseSession()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false)

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

    // Preferences state
    const [preferences, setPreferences] = useState<UserPreferences>({
        id: '',
        user_id: '',
        email_notifications: true,
        task_reminders: true,
        weekly_digest: false,
        theme: 'light',
        timezone: 'UTC',
        date_format: 'MM/DD/YYYY',
        time_format: '12h',
        created_at: '',
        updated_at: ''
    })

    // Password change state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    // Messages state
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    useEffect(() => {
        if (session?.user) {
            loadUserData()
        }
    }, [session])

    const loadUserData = async () => {
        try {
            setLoading(true)
            const userId = session?.user?.id
            const userEmail = session?.user?.email

            if (userId && userEmail) {
                // Set basic profile data from session
                setProfile(prev => ({
                    ...prev,
                    id: userId,
                    email: userEmail,
                    full_name: session?.user?.user_metadata?.full_name || '',
                    created_at: session?.user?.created_at || ''
                }))

                // Load additional profile data if it exists in a profiles table
                // For now, we'll use demo data
                setProfile(prev => ({
                    ...prev,
                    company: 'Your Company Inc.',
                    phone: '+1 (555) 123-4567',
                    bio: 'Professional client relationship manager',
                    updated_at: new Date().toISOString()
                }))

                // Load preferences (demo data)
                setPreferences(prev => ({
                    ...prev,
                    id: 'pref-' + userId,
                    user_id: userId,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }))
            }
        } catch (error) {
            console.error('Error loading user data:', error)
            showMessage('error', 'Failed to load user data')
        } finally {
            setLoading(false)
        }
    }

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text })
        setTimeout(() => setMessage(null), 5000)
    }

    const handleProfileUpdate = async () => {
        try {
            setSaving(true)
            // In a real implementation, you would update the profiles table in Supabase
            // For now, we'll simulate the update
            await new Promise(resolve => setTimeout(resolve, 1000))

            setProfile(prev => ({
                ...prev,
                updated_at: new Date().toISOString()
            }))

            showMessage('success', 'Profile updated successfully!')
        } catch (error) {
            console.error('Error updating profile:', error)
            showMessage('error', 'Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    const handlePreferencesUpdate = async () => {
        try {
            setSaving(true)
            // In a real implementation, you would update the user_preferences table
            await new Promise(resolve => setTimeout(resolve, 1000))

            setPreferences(prev => ({
                ...prev,
                updated_at: new Date().toISOString()
            }))

            showMessage('success', 'Preferences updated successfully!')
        } catch (error) {
            console.error('Error updating preferences:', error)
            showMessage('error', 'Failed to update preferences')
        } finally {
            setSaving(false)
        }
    }

    const handlePasswordChange = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showMessage('error', 'New passwords do not match')
            return
        }

        if (passwordData.newPassword.length < 6) {
            showMessage('error', 'Password must be at least 6 characters')
            return
        }

        try {
            setSaving(true)
            // In a real implementation, you would use Supabase auth to update password
            await new Promise(resolve => setTimeout(resolve, 1000))

            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            })

            showMessage('success', 'Password updated successfully!')
        } catch (error) {
            console.error('Error updating password:', error)
            showMessage('error', 'Failed to update password')
        } finally {
            setSaving(false)
        }
    }

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading settings...</div>
            </div>
        )
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your account settings and preferences.
                </p>
            </div>

            {/* Message */}
            {message && (
                <div className={`p-4 rounded-md ${message.type === 'success'
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                    {message.text}
                </div>
            )}

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="preferences">Preferences</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="data">Data</TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Profile Information
                            </CardTitle>
                            <CardDescription>
                                Update your personal information and how others see you.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Avatar Section */}
                            <div className="flex items-center space-x-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={profile.avatar_url} />
                                    <AvatarFallback className="text-lg">
                                        {getInitials(profile.full_name || profile.email)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-2">
                                    <Button variant="outline" size="sm">
                                        <Camera className="h-4 w-4 mr-2" />
                                        Change Avatar
                                    </Button>
                                    <p className="text-sm text-muted-foreground">
                                        Upload a new profile picture
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            {/* Profile Form */}
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="full_name">Full Name</Label>
                                    <Input
                                        id="full_name"
                                        value={profile.full_name}
                                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                        placeholder="Enter your full name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={profile.email}
                                        disabled
                                        className="bg-muted"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Email cannot be changed here. Contact support if needed.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="company">Company</Label>
                                    <Input
                                        id="company"
                                        value={profile.company}
                                        onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                                        placeholder="Your company name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        value={profile.phone}
                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                        placeholder="+1 (555) 123-4567"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea
                                    id="bio"
                                    value={profile.bio}
                                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                    placeholder="Tell us about yourself..."
                                    rows={3}
                                />
                            </div>

                            <div className="flex justify-end">
                                <Button onClick={handleProfileUpdate} disabled={saving}>
                                    {saving ? 'Saving...' : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Preferences Tab */}
                <TabsContent value="preferences" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                Notifications
                            </CardTitle>
                            <CardDescription>
                                Configure how you receive notifications.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Email Notifications</p>
                                    <p className="text-sm text-muted-foreground">
                                        Receive updates about your clients and tasks via email
                                    </p>
                                </div>
                                <Button
                                    variant={preferences.email_notifications ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setPreferences({
                                        ...preferences,
                                        email_notifications: !preferences.email_notifications
                                    })}
                                >
                                    {preferences.email_notifications ? 'Enabled' : 'Disabled'}
                                </Button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Task Reminders</p>
                                    <p className="text-sm text-muted-foreground">
                                        Get reminded about upcoming task deadlines
                                    </p>
                                </div>
                                <Button
                                    variant={preferences.task_reminders ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setPreferences({
                                        ...preferences,
                                        task_reminders: !preferences.task_reminders
                                    })}
                                >
                                    {preferences.task_reminders ? 'Enabled' : 'Disabled'}
                                </Button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Weekly Digest</p>
                                    <p className="text-sm text-muted-foreground">
                                        Receive a weekly summary of your activities
                                    </p>
                                </div>
                                <Button
                                    variant={preferences.weekly_digest ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setPreferences({
                                        ...preferences,
                                        weekly_digest: !preferences.weekly_digest
                                    })}
                                >
                                    {preferences.weekly_digest ? 'Enabled' : 'Disabled'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Display Preferences</CardTitle>
                            <CardDescription>
                                Customize how dates and times are displayed.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="timezone">Timezone</Label>
                                    <Input
                                        id="timezone"
                                        value={preferences.timezone}
                                        onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                                        placeholder="UTC"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="date_format">Date Format</Label>
                                    <Input
                                        id="date_format"
                                        value={preferences.date_format}
                                        onChange={(e) => setPreferences({ ...preferences, date_format: e.target.value })}
                                        placeholder="MM/DD/YYYY"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Time Format</p>
                                    <p className="text-sm text-muted-foreground">
                                        Choose between 12-hour and 24-hour time format
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPreferences({
                                        ...preferences,
                                        time_format: preferences.time_format === '12h' ? '24h' : '12h'
                                    })}
                                >
                                    {preferences.time_format === '12h' ? '12 Hour' : '24 Hour'}
                                </Button>
                            </div>

                            <div className="flex justify-end">
                                <Button onClick={handlePreferencesUpdate} disabled={saving}>
                                    {saving ? 'Saving...' : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Preferences
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Change Password
                            </CardTitle>
                            <CardDescription>
                                Update your password to keep your account secure.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current_password">Current Password</Label>
                                <div className="relative">
                                    <Input
                                        id="current_password"
                                        type={showPassword ? "text" : "password"}
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({
                                            ...passwordData,
                                            currentPassword: e.target.value
                                        })}
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
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({
                                        ...passwordData,
                                        newPassword: e.target.value
                                    })}
                                    placeholder="Enter new password"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm_password">Confirm New Password</Label>
                                <Input
                                    id="confirm_password"
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({
                                        ...passwordData,
                                        confirmPassword: e.target.value
                                    })}
                                    placeholder="Confirm new password"
                                />
                            </div>
                            <div className="flex justify-end">
                                <Button onClick={handlePasswordChange} disabled={saving}>
                                    {saving ? 'Updating...' : 'Update Password'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-red-600">Danger Zone</CardTitle>
                            <CardDescription>
                                Irreversible and destructive actions.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-4 border border-red-200 rounded-md bg-red-50">
                                <div>
                                    <p className="font-medium text-red-800">Delete Account</p>
                                    <p className="text-sm text-red-600">
                                        Permanently delete your account and all data
                                    </p>
                                </div>
                                <Dialog open={isDeleteAccountOpen} onOpenChange={setIsDeleteAccountOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="destructive" size="sm">
                                            Delete Account
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Are you absolutely sure?</DialogTitle>
                                            <DialogDescription>
                                                This action cannot be undone. This will permanently delete your
                                                account and remove all your data from our servers.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="flex justify-end space-x-2">
                                            <Button variant="outline" onClick={() => setIsDeleteAccountOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button variant="destructive" onClick={() => setIsDeleteAccountOpen(false)}>
                                                Delete Account
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Data Tab */}
                <TabsContent value="data" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Database className="h-5 w-5" />
                                Data Management
                            </CardTitle>
                            <CardDescription>
                                Export your data or clear specific information.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 border rounded-md">
                                <div>
                                    <p className="font-medium">Export All Data</p>
                                    <p className="text-sm text-muted-foreground">
                                        Download all your clients, tasks, and settings
                                    </p>
                                </div>
                                <Button variant="outline">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Export
                                </Button>
                            </div>
                            <div className="flex items-center justify-between p-4 border rounded-md">
                                <div>
                                    <p className="font-medium">Clear Completed Tasks</p>
                                    <p className="text-sm text-muted-foreground">
                                        Remove all completed tasks from your account
                                    </p>
                                </div>
                                <Button variant="outline">
                                    Clear Tasks
                                </Button>
                            </div>
                            <div className="flex items-center justify-between p-4 border rounded-md">
                                <div>
                                    <p className="font-medium">Reset Preferences</p>
                                    <p className="text-sm text-muted-foreground">
                                        Reset all preferences to default values
                                    </p>
                                </div>
                                <Button variant="outline">
                                    Reset
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Account Statistics</CardTitle>
                            <CardDescription>
                                Overview of your account usage and data.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="text-center p-4 border rounded-md">
                                    <p className="text-2xl font-bold">12</p>
                                    <p className="text-sm text-muted-foreground">Total Clients</p>
                                </div>
                                <div className="text-center p-4 border rounded-md">
                                    <p className="text-2xl font-bold">24</p>
                                    <p className="text-sm text-muted-foreground">Active Tasks</p>
                                </div>
                                <div className="text-center p-4 border rounded-md">
                                    <p className="text-2xl font-bold">3</p>
                                    <p className="text-sm text-muted-foreground">Months Active</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

