"use client"
import React, { useState, useEffect } from 'react'
import { Search, Plus, Phone, Mail, Building, Calendar, FileText, MoreHorizontal, User, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DashboardService } from '@/lib/dashboardService'
import { Client } from '@/lib/types'
import useSupabaseSession from '@/hooks/useSupabaseSession'

// Dummy data for demonstration
const dummyClients = [
    {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        company: 'Tech Solutions Inc.',
        phone: '+1 (555) 123-4567',
        notes: 'Initial consultation completed',
        user_id: 'user1',
        created_at: '2024-06-15T10:00:00Z',
        updated_at: '2024-06-20T14:30:00Z'
    },
    {
        id: '2',
        name: 'Michael Chen',
        email: 'michael.chen@startup.com',
        company: 'StartupXYZ',
        phone: '+1 (555) 987-6543',
        notes: 'Looking for web development services',
        user_id: 'user1',
        created_at: '2024-06-18T09:15:00Z',
        updated_at: '2024-06-22T11:45:00Z'
    },
    {
        id: '3',
        name: 'Emily Rodriguez',
        email: 'emily.r@consulting.com',
        company: 'Rodriguez Consulting',
        phone: '+1 (555) 456-7890',
        notes: 'Requires mobile app development',
        user_id: 'user1',
        created_at: '2024-06-20T16:20:00Z',
        updated_at: '2024-06-25T13:10:00Z'
    },
    {
        id: '4',
        name: 'David Thompson',
        email: 'david@retailstore.com',
        company: 'Thompson Retail',
        phone: '+1 (555) 234-5678',
        notes: 'E-commerce platform needed',
        user_id: 'user1',
        created_at: '2024-06-22T11:30:00Z',
        updated_at: '2024-06-27T09:00:00Z'
    },
    {
        id: '5',
        name: 'Lisa Park',
        email: 'lisa.park@nonprofit.org',
        company: 'Community Nonprofit',
        phone: '+1 (555) 345-6789',
        notes: 'Website redesign project',
        user_id: 'user1',
        created_at: '2024-06-25T14:45:00Z',
        updated_at: '2024-06-30T16:20:00Z'
    }
]

// Timeline data for client details
const timelineData = [
    {
        id: '1',
        type: 'meeting',
        title: 'Initial Meeting',
        date: 'June 15, 2024',
        icon: Calendar
    },
    {
        id: '2',
        type: 'email',
        title: 'Proposal Sent',
        date: 'June 20, 2024',
        icon: Mail
    },
    {
        id: '3',
        type: 'contract',
        title: 'Contract Signed',
        date: 'June 25, 2024',
        icon: FileText
    }
]

export default function ClientsTab() {
    const session = useSupabaseSession()
    const [clients, setClients] = useState<Client[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const [selectedClient, setSelectedClient] = useState<Client | null>(null)
    const [showClientDetails, setShowClientDetails] = useState(false)
    const [isAddClientOpen, setIsAddClientOpen] = useState(false)

    const fetchClients = async () => {
        try {
            setLoading(true)
            const userId = session?.user?.id
            if (userId) {
                // In production, this would fetch from the database
                const clientsData = await DashboardService.getRecentClients(50, userId)

                // For demo purposes, use dummy data if no real data
                if (clientsData.length === 0) {
                    setClients(dummyClients)
                } else {
                    setClients(clientsData)
                }
            } else {
                // Use dummy data when not authenticated (for demo)
                setClients(dummyClients)
            }
        } catch (error) {
            console.error('Error fetching clients:', error)
            // Fallback to dummy data
            setClients(dummyClients)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchClients()
    }, [session])

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.company?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const handleClientClick = (client: Client) => {
        setSelectedClient(client)
        setShowClientDetails(true)
    }

    const handleBackToList = () => {
        setShowClientDetails(false)
        setSelectedClient(null)
    }

    if (showClientDetails && selectedClient) {
        return (
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" onClick={handleBackToList}>
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Back to Clients
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Client Details</h1>
                            <p className="text-muted-foreground">
                                Manage all information and activities related to this client.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Contact Information */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                                    <p className="font-medium">{selectedClient.name}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                                    <p className="font-medium">{selectedClient.email}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                                    <p className="font-medium">{selectedClient.phone || 'Not provided'}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-muted-foreground">Company</Label>
                                    <p className="font-medium">{selectedClient.company || 'Not provided'}</p>
                                </div>
                            </div>
                            {selectedClient.notes && (
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                                    <p className="font-medium">{selectedClient.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {timelineData.map((item, index) => (
                                    <div key={item.id} className="flex items-start space-x-3">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                <item.icon className="h-4 w-4 text-primary" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium">{item.title}</p>
                                            <p className="text-xs text-muted-foreground">{item.date}</p>
                                        </div>
                                        {index < timelineData.length - 1 && (
                                            <div className="absolute left-[47px] mt-8 w-px h-6 bg-border" />
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 space-y-2">
                                <Button className="w-full" size="sm">
                                    Add Task
                                </Button>
                                <Button variant="outline" className="w-full" size="sm">
                                    Generate Follow-up Email
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
                    <p className="text-muted-foreground">
                        Manage your clients and their information.
                    </p>
                </div>
                <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Client
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add New Client</DialogTitle>
                            <DialogDescription>
                                Add a new client to your database.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" placeholder="Client name" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="client@example.com" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="company">Company</Label>
                                <Input id="company" placeholder="Company name" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" placeholder="+1 (555) 123-4567" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea id="notes" placeholder="Additional notes..." />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setIsAddClientOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={() => setIsAddClientOpen(false)}>
                                Add Client
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center space-x-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search clients..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Clients Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Clients ({filteredClients.length})</CardTitle>
                    <CardDescription>
                        A list of all your clients and their contact information.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-muted-foreground">Loading clients...</div>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Company</TableHead>
                                    <TableHead>Added</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-[70px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredClients.map((client) => (
                                    <TableRow
                                        key={client.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleClientClick(client)}
                                    >
                                        <TableCell className="font-medium">
                                            <div className="flex items-center space-x-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback className="text-xs">
                                                        {getInitials(client.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">{client.name}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center text-sm">
                                                    <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                                                    {client.email}
                                                </div>
                                                {client.phone && (
                                                    <div className="flex items-center text-sm text-muted-foreground">
                                                        <Phone className="h-3 w-3 mr-1" />
                                                        {client.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {client.company ? (
                                                <div className="flex items-center">
                                                    <Building className="h-3 w-3 mr-1 text-muted-foreground" />
                                                    {client.company}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {formatDate(client.created_at)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">Active</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleClientClick(client)
                                                    }}>
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                                        Edit Client
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                                        Add Task
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        Delete Client
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}

                    {!loading && filteredClients.length === 0 && (
                        <div className="text-center py-8">
                            <User className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-2 text-sm font-semibold">No clients found</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first client.'}
                            </p>
                            {!searchTerm && (
                                <div className="mt-6">
                                    <Button onClick={() => setIsAddClientOpen(true)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Client
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
