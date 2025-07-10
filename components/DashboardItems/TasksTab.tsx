"use client"
import React, { useState, useEffect } from 'react'
import { Plus, Calendar, User, ChevronDown, Filter, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DashboardService } from '@/lib/dashboardService'
import { Task, Client } from '@/lib/types'
import useSupabaseSession from '@/hooks/useSupabaseSession'

// Dummy data for demonstration
const dummyTasks: Task[] = [
    {
        id: '1',
        title: 'Design Landing Page',
        description: 'Create a modern landing page design for the client',
        status: 'in_progress',
        due_date: '2025-03-15',
        client_id: '1',
        user_id: 'user1',
        created_at: '2025-03-10T10:00:00Z',
        updated_at: '2025-03-10T10:00:00Z',
        clients: {
            id: '1',
            name: 'Tech Solutions Inc.',
            email: 'contact@techsolutions.com',
            company: 'Tech Solutions Inc.',
            user_id: 'user1',
            created_at: '2025-03-01T10:00:00Z',
            updated_at: '2025-03-01T10:00:00Z'
        }
    },
    {
        id: '2',
        title: 'Develop API Integration',
        description: 'Integrate third-party API for payment processing',
        status: 'todo',
        due_date: '2025-03-18',
        client_id: '2',
        user_id: 'user1',
        created_at: '2025-03-10T11:00:00Z',
        updated_at: '2025-03-10T11:00:00Z',
        clients: {
            id: '2',
            name: 'Global Retail Group',
            email: 'contact@globalretail.com',
            company: 'Global Retail Group',
            user_id: 'user1',
            created_at: '2025-03-02T10:00:00Z',
            updated_at: '2025-03-02T10:00:00Z'
        }
    },
    {
        id: '3',
        title: 'Prepare Monthly Report',
        description: 'Compile monthly performance report with analytics',
        status: 'completed',
        due_date: '2025-03-12',
        client_id: '3',
        user_id: 'user1',
        created_at: '2025-03-09T10:00:00Z',
        updated_at: '2025-03-12T15:00:00Z',
        clients: {
            id: '3',
            name: 'Innovative Startups LLC',
            email: 'contact@innovativestartups.com',
            company: 'Innovative Startups LLC',
            user_id: 'user1',
            created_at: '2025-03-03T10:00:00Z',
            updated_at: '2025-03-03T10:00:00Z'
        }
    },
    {
        id: '4',
        title: 'Client Onboarding',
        description: 'Complete onboarding process for new client',
        status: 'todo',
        due_date: '2025-03-14',
        client_id: '4',
        user_id: 'user1',
        created_at: '2025-03-08T10:00:00Z',
        updated_at: '2025-03-08T10:00:00Z',
        clients: {
            id: '4',
            name: 'Dynamic Ventures Ltd.',
            email: 'contact@dynamicventures.com',
            company: 'Dynamic Ventures Ltd.',
            user_id: 'user1',
            created_at: '2025-03-04T10:00:00Z',
            updated_at: '2025-03-04T10:00:00Z'
        }
    },
    {
        id: '5',
        title: 'Review Project Proposal',
        description: 'Review and finalize project proposal document',
        status: 'in_progress',
        due_date: '2025-03-16',
        client_id: '5',
        user_id: 'user1',
        created_at: '2025-03-07T10:00:00Z',
        updated_at: '2025-03-10T14:00:00Z',
        clients: {
            id: '5',
            name: 'Creative Minds Agency',
            email: 'contact@creativeminds.com',
            company: 'Creative Minds Agency',
            user_id: 'user1',
            created_at: '2025-03-05T10:00:00Z',
            updated_at: '2025-03-05T10:00:00Z'
        }
    }
]

export default function TasksTab() {
    const session = useSupabaseSession()
    const [tasks, setTasks] = useState<Task[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const [activeFilter, setActiveFilter] = useState<'all' | 'due_today' | 'due_this_week' | 'overdue'>('all')
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)

    const fetchTasks = async () => {
        try {
            setLoading(true)
            const userId = session?.user?.id
            if (userId) {
                // In production, this would fetch from the database
                const tasksData = await DashboardService.getDueTasks(50, userId)

                // For demo purposes, use dummy data if no real data
                if (tasksData.length === 0) {
                    setTasks(dummyTasks)
                } else {
                    setTasks(tasksData)
                }
            } else {
                // Use dummy data when not authenticated (for demo)
                setTasks(dummyTasks)
            }
        } catch (error) {
            console.error('Error fetching tasks:', error)
            // Fallback to dummy data
            setTasks(dummyTasks)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTasks()
    }, [session])

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
            case 'in_progress':
                return <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>
            case 'todo':
            case 'pending':
                return <Badge variant="default" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">To Do</Badge>
            case 'overdue':
                return <Badge variant="destructive">Overdue</Badge>
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        })
    }

    const isOverdue = (dueDate: string) => {
        return new Date(dueDate) < new Date()
    }

    const isDueToday = (dueDate: string) => {
        const today = new Date()
        const due = new Date(dueDate)
        return today.toDateString() === due.toDateString()
    }

    const isDueThisWeek = (dueDate: string) => {
        const today = new Date()
        const due = new Date(dueDate)
        const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
        return due >= today && due <= weekFromNow
    }

    const filteredTasks = tasks.filter(task => {
        // First apply search filter
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.clients?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.description?.toLowerCase().includes(searchTerm.toLowerCase())

        if (!matchesSearch) return false

        // Then apply status filter
        switch (activeFilter) {
            case 'due_today':
                return isDueToday(task.due_date)
            case 'due_this_week':
                return isDueThisWeek(task.due_date)
            case 'overdue':
                return isOverdue(task.due_date) && task.status !== 'completed'
            case 'all':
            default:
                return true
        }
    })

    const getFilterCount = (filter: string) => {
        switch (filter) {
            case 'due_today':
                return tasks.filter(task => isDueToday(task.due_date)).length
            case 'due_this_week':
                return tasks.filter(task => isDueThisWeek(task.due_date)).length
            case 'overdue':
                return tasks.filter(task => isOverdue(task.due_date) && task.status !== 'completed').length
            default:
                return tasks.length
        }
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
                    <p className="text-muted-foreground">
                        Manage and track all your tasks and deadlines.
                    </p>
                </div>
                <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Task
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add New Task</DialogTitle>
                            <DialogDescription>
                                Create a new task and assign it to a client.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="task-title">Task Title</Label>
                                <Input id="task-title" placeholder="Enter task title" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="task-client">Client</Label>
                                <Input id="task-client" placeholder="Select client" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="task-due-date">Due Date</Label>
                                <Input id="task-due-date" type="date" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="task-status">Status</Label>
                                <Input id="task-status" placeholder="To Do" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="task-description">Description</Label>
                                <Textarea id="task-description" placeholder="Task description..." />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={() => setIsAddTaskOpen(false)}>
                                Add Task
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters and Search */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        {/* Filter Buttons */}
                        <div className="flex flex-wrap gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant={activeFilter === 'due_today' ? 'default' : 'outline'} size="sm">
                                        Due Today ({getFilterCount('due_today')})
                                        <ChevronDown className="h-4 w-4 ml-2" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => setActiveFilter('due_today')}>
                                        Due Today
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant={activeFilter === 'due_this_week' ? 'default' : 'outline'} size="sm">
                                        Due This Week ({getFilterCount('due_this_week')})
                                        <ChevronDown className="h-4 w-4 ml-2" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => setActiveFilter('due_this_week')}>
                                        Due This Week
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant={activeFilter === 'overdue' ? 'destructive' : 'outline'} size="sm">
                                        Overdue ({getFilterCount('overdue')})
                                        <ChevronDown className="h-4 w-4 ml-2" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => setActiveFilter('overdue')}>
                                        Overdue
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Button
                                variant={activeFilter === 'all' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setActiveFilter('all')}
                            >
                                All Tasks ({tasks.length})
                            </Button>
                        </div>

                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search tasks..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tasks Table */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        {activeFilter === 'all' ? 'All Tasks' :
                            activeFilter === 'due_today' ? 'Due Today' :
                                activeFilter === 'due_this_week' ? 'Due This Week' :
                                    'Overdue Tasks'} ({filteredTasks.length})
                    </CardTitle>
                    <CardDescription>
                        {activeFilter === 'all' ? 'Complete overview of all your tasks' :
                            activeFilter === 'due_today' ? 'Tasks that are due today' :
                                activeFilter === 'due_this_week' ? 'Tasks due within the next 7 days' :
                                    'Tasks that are past their due date'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-muted-foreground">Loading tasks...</div>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Task</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTasks.map((task) => (
                                    <TableRow key={task.id} className="cursor-pointer hover:bg-muted/50">
                                        <TableCell className="font-medium">
                                            <div>
                                                <div className="font-medium">{task.title}</div>
                                                {task.description && (
                                                    <div className="text-sm text-muted-foreground mt-1">
                                                        {task.description}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center">
                                                <User className="h-3 w-3 mr-1 text-muted-foreground" />
                                                {task.clients?.name || 'No client assigned'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className={`flex items-center ${isOverdue(task.due_date) && task.status !== 'completed'
                                                    ? 'text-red-600'
                                                    : isDueToday(task.due_date)
                                                        ? 'text-orange-600 font-medium'
                                                        : 'text-muted-foreground'
                                                }`}>
                                                <Calendar className="h-3 w-3 mr-1" />
                                                {formatDate(task.due_date)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(task.status)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}

                    {!loading && filteredTasks.length === 0 && (
                        <div className="text-center py-8">
                            <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-2 text-sm font-semibold">No tasks found</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {searchTerm
                                    ? 'Try adjusting your search terms or filters.'
                                    : activeFilter === 'all'
                                        ? 'Get started by adding your first task.'
                                        : `No tasks match the current filter.`
                                }
                            </p>
                            {!searchTerm && activeFilter === 'all' && (
                                <div className="mt-6">
                                    <Button onClick={() => setIsAddTaskOpen(true)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Task
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
