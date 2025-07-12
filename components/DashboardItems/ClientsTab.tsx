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
import { DashboardService } from '@/lib/dashboardService'
import { Client } from '@/lib/types'
import useSupabaseSession from '@/hooks/useSupabaseSession'
import AddClientDialog from '@/components/AddClientDialog'
import AddTaskDialog from '@/components/AddTaskDialog'
import GenerateEmailDialog from '@/components/GenerateEmailDialog'

export default function ClientsTab() {
    const session = useSupabaseSession()
    const [clients, setClients] = useState<Client[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const [selectedClient, setSelectedClient] = useState<Client | null>(null)
    const [showClientDetails, setShowClientDetails] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [clientToDelete, setClientToDelete] = useState<Client | null>(null)
    const [preSelectedClientId, setPreSelectedClientId] = useState<string | undefined>(undefined)
    const [clientToEdit, setClientToEdit] = useState<Client | null>(null)

    // Refs for dialog triggers
    const editClientTriggerRef = React.useRef<HTMLButtonElement>(null)
    const addTaskTriggerRef = React.useRef<HTMLButtonElement>(null)

    const fetchClients = async () => {
        try {
            setLoading(true)
            const userId = session?.user?.id
            if (userId) {
                // Fetch from the database
                const clientsData = await DashboardService.getRecentClients(50, userId)
                setClients(clientsData)
            } else {
                // No session, show empty state
                setClients([])
            }
        } catch (error) {
            console.error('Error fetching clients:', error)
            // Show empty state on error
            setClients([])
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

    const handleEditClient = (client: Client) => {
        setClientToEdit(client)
        editClientTriggerRef.current?.click()
    }

    const handleAddTask = (client: Client) => {
        setPreSelectedClientId(client.id)
        // Small delay to ensure the state is updated before opening the dialog
        setTimeout(() => {
            addTaskTriggerRef.current?.click()
        }, 10)
    }

    const handleDeleteClient = (client: Client) => {
        setClientToDelete(client)
        setIsDeleteDialogOpen(true)
    }

    const confirmDeleteClient = async () => {
        if (!clientToDelete || !session?.user?.id) return

        try {
            await DashboardService.deleteClient(clientToDelete.id, session.user.id)
            setClients(clients.filter(c => c.id !== clientToDelete.id))
            setIsDeleteDialogOpen(false)
            setClientToDelete(null)

            // If we're viewing details of the deleted client, go back to list
            if (selectedClient?.id === clientToDelete.id) {
                handleBackToList()
            }
        } catch (error) {
            console.error('Error deleting client:', error)
        }
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

                <div className="grid gap-6">
                    {/* Contact Information */}
                    <Card>
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

                            {/* Action Buttons */}
                            <div className="flex gap-4 pt-4">
                                <AddTaskDialog
                                    preSelectedClientId={selectedClient.id}
                                    onTaskAdded={fetchClients}
                                    trigger={
                                        <Button size="sm">
                                            Add Task
                                        </Button>
                                    }
                                />
                                <GenerateEmailDialog
                                    clientName={selectedClient.name}
                                    clientEmail={selectedClient.email}
                                    clientCompany={selectedClient.company || ''}
                                    trigger={
                                        <Button variant="outline" size="sm">
                                            Generate Follow-up Email
                                        </Button>
                                    }
                                />
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
                <div className="flex gap-2">
                    <AddClientDialog onClientAdded={fetchClients} trigger={
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Client
                        </Button>
                    } />
                </div>
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
                                                    <DropdownMenuItem onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleEditClient(client)
                                                    }}>
                                                        Edit Client
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleAddTask(client)
                                                    }}>
                                                        Add Task
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleDeleteClient(client)
                                                        }}
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
                                    <AddClientDialog onClientAdded={fetchClients} trigger={
                                        <Button>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Client
                                        </Button>
                                    } />
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Client Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Client</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{clientToDelete?.name}"? This will permanently remove the client and all associated tasks. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDeleteClient}>
                            Delete Client
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Hidden triggers for dialogs */}
            <AddClientDialog
                onClientAdded={fetchClients}
                editClient={clientToEdit}
                trigger={
                    <Button
                        ref={editClientTriggerRef}
                        style={{ display: 'none' }}
                    >
                        Edit Client
                    </Button>
                }
            />

            <AddTaskDialog
                onTaskAdded={fetchClients}
                preSelectedClientId={preSelectedClientId}
                trigger={
                    <Button
                        ref={addTaskTriggerRef}
                        style={{ display: 'none' }}
                    >
                        Add Task
                    </Button>
                }
            />
        </div>
    )
}
