"use client"
import React, { useState } from 'react'
import { Users } from 'lucide-react'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DashboardService } from '@/lib/dashboardService'
import { Client } from '@/lib/types'
import useSupabaseSession from '@/hooks/useSupabaseSession'
import { toast } from 'sonner'

interface AddClientDialogProps {
    onClientAdded?: () => void
    trigger?: React.ReactNode
    className?: string
    editClient?: Client | null
    onClose?: () => void
}

export default function AddClientDialog({ onClientAdded, trigger, className, editClient, onClose }: AddClientDialogProps) {
    const session = useSupabaseSession()
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        phone: '',
        notes: '',
        status: 'active' as 'active' | 'inactive'
    })

    // Update form data when editClient changes
    React.useEffect(() => {
        if (editClient) {
            setFormData({
                name: editClient.name || '',
                email: editClient.email || '',
                company: editClient.company || '',
                phone: editClient.phone || '',
                notes: editClient.notes || '',
                status: editClient.status as 'active' | 'inactive'
            })
        } else {
            // Reset form for new client
            setFormData({
                name: '',
                email: '',
                company: '',
                phone: '',
                notes: '',
                status: 'active'
            })
        }
    }, [editClient])

    const isEditing = !!editClient

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSubmit = async () => {
        if (!formData.name || !formData.email || !formData.company) {
            toast.error('Name, email, and company are required')
            return
        }

        try {
            setLoading(true)
            const userId = session?.user?.id

            if (!userId) {
                toast.error('You must be logged in to add a client')
                return
            }

            if (isEditing && editClient) {
                // Update existing client
                await DashboardService.updateClient(editClient.id, {
                    ...formData,
                    updated_at: new Date().toISOString()
                }, userId)
            } else {
                // Create new client
                await DashboardService.createClient({
                    ...formData,
                    userId
                })
            }

            // Reset form
            setFormData({
                name: '',
                email: '',
                company: '',
                phone: '',
                notes: '',
                status: 'active'
            })

            setIsOpen(false)

            // Show success toast
            toast.success(`Client ${isEditing ? 'updated' : 'created'} successfully!`)

            // Call callback to refresh data
            if (onClientAdded) {
                onClientAdded()
            }
        } catch (error) {
            console.error(`Error ${isEditing ? 'updating' : 'creating'} client:`, error)
            toast.error(`Failed to ${isEditing ? 'update' : 'create'} client. Please try again.`)
        } finally {
            setLoading(false)
        }
    }

    const handleDialogOpenChange = (open: boolean) => {
        setIsOpen(open)
        if (!open && onClose) {
            onClose()
        }
    }

    const defaultTrigger = (
        <Button className={`h-auto p-4 flex-col gap-2 ${className}`} variant="outline">
            <Users className="h-6 w-6" />
            <span>Add New Client</span>
        </Button>
    )

    return (
        <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
                {trigger || defaultTrigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Client' : 'Add New Client'}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? 'Edit the client information.' : 'Add a new client to your database.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                            id="name"
                            placeholder="Client name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="client@example.com"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="company">Company *</Label>
                        <Input
                            id="company"
                            placeholder="Agency, Freelance, or Company name"
                            value={formData.company}
                            onChange={(e) => handleInputChange('company', e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            placeholder="+91 855-123-XXXX"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(value: 'active' | 'inactive') => handleInputChange('status', value)}
                            disabled={loading}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            placeholder="Additional notes..."
                            value={formData.notes}
                            onChange={(e) => handleInputChange('notes', e.target.value)}
                            disabled={loading}
                        />
                    </div>
                </div>
                <div className="flex justify-end space-x-2">
                    <Button
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !formData.name || !formData.email || !formData.company}
                    >
                        {loading ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Client' : 'Add Client')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
