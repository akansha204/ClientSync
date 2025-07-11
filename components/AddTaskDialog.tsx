"use client"
import React, { useState, useEffect } from 'react'
import { CheckSquare, Calendar as CalendarIcon } from 'lucide-react'
import { format } from "date-fns"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { DashboardService } from '@/lib/dashboardService'
import { Client } from '@/lib/types'
import useSupabaseSession from '@/hooks/useSupabaseSession'

interface AddTaskDialogProps {
    onTaskAdded?: () => void
    trigger?: React.ReactNode
    className?: string
    preSelectedClientId?: string
}

export default function AddTaskDialog({ onTaskAdded, trigger, className, preSelectedClientId }: AddTaskDialogProps) {
    const session = useSupabaseSession()
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [clients, setClients] = useState<Client[]>([])
    const [loadingClients, setLoadingClients] = useState(true)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        client_id: preSelectedClientId || '',
        due_date: undefined as Date | undefined,
        status: 'pending' as 'pending' | 'in_progress' | 'completed'
    })

    const fetchClients = async () => {
        try {
            setLoadingClients(true)
            const userId = session?.user?.id
            if (userId) {
                const clientsData = await DashboardService.getAllClients(userId)
                setClients(clientsData)
            }
        } catch (error) {
            console.error('Error fetching clients:', error)
        } finally {
            setLoadingClients(false)
        }
    }

    useEffect(() => {
        if (session && isOpen) {
            fetchClients()
        }
    }, [session, isOpen])

    useEffect(() => {
        if (preSelectedClientId) {
            setFormData(prev => ({
                ...prev,
                client_id: preSelectedClientId
            }))
        }
    }, [preSelectedClientId])

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSubmit = async () => {
        if (!formData.title || !formData.client_id || !formData.due_date || !formData.status) {
            alert('Title, client, due date, and status are required')
            return
        }

        try {
            setLoading(true)
            const userId = session?.user?.id

            if (!userId) {
                alert('You must be logged in to add a task')
                return
            }

            // Call the dashboard service to create the task
            await DashboardService.createTask({
                title: formData.title,
                description: formData.description,
                client_id: formData.client_id,
                due_date: format(formData.due_date, 'yyyy-MM-dd'),
                status: formData.status,
                userId
            })

            // Reset form
            setFormData({
                title: '',
                description: '',
                client_id: preSelectedClientId || '',
                due_date: undefined,
                status: 'pending'
            })

            setIsOpen(false)

            // Call callback to refresh data
            if (onTaskAdded) {
                onTaskAdded()
            }
        } catch (error) {
            console.error('Error creating task:', error)
            alert('Failed to create task. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    // Get today's date for validation
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const defaultTrigger = (
        <Button className={`h-auto p-4 flex-col gap-2 ${className}`} variant="outline">
            <CheckSquare className="h-6 w-6" />
            <span>Create Task</span>
        </Button>
    )

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || defaultTrigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                    <DialogDescription>
                        Add a new task for one of your clients.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Task Title *</Label>
                        <Input
                            id="title"
                            placeholder="Task title"
                            value={formData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="client">Client *</Label>
                        <Select
                            value={formData.client_id}
                            onValueChange={(value) => handleInputChange('client_id', value)}
                            disabled={loading || loadingClients}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={
                                    loadingClients ? "Loading clients..." :
                                        preSelectedClientId ? "Client selected" :
                                            "Select a client"
                                } />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                                {clients.length === 0 && !loadingClients && (
                                    <div className="p-2 text-sm text-muted-foreground">
                                        {preSelectedClientId ? "No clients found" : "No clients available. Please add a client first."}
                                    </div>
                                )}
                                {!preSelectedClientId && clients.length > 0 && (
                                    <SelectItem value="" disabled>
                                        <span className="text-muted-foreground">Choose a client for this task</span>
                                    </SelectItem>
                                )}
                                {clients.map((client) => (
                                    <SelectItem key={client.id} value={client.id}>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{client.name}</span>
                                            <span className="text-sm text-muted-foreground">
                                                {client.company || 'No company specified'} • {client.email}
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Due Date *</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !formData.due_date && "text-muted-foreground"
                                    )}
                                    disabled={loading}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {formData.due_date ? format(formData.due_date, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={formData.due_date}
                                    onSelect={(date) => setFormData(prev => ({ ...prev, due_date: date }))}
                                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="status">Status *</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(value: 'pending' | 'in_progress' | 'completed') =>
                                setFormData(prev => ({ ...prev, status: value }))}
                            disabled={loading}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Task description..."
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            disabled={loading}
                            rows={3}
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
                        disabled={loading || !formData.title || !formData.client_id || !formData.due_date}
                    >
                        {loading ? 'Creating...' : 'Create Task'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
