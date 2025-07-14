"use client"
import React, { useState, useEffect } from 'react'
import { Plus, Calendar, User, ChevronDown, Filter, Search, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { DashboardService } from '@/lib/dashboardService'
import { Task, Client } from '@/lib/types'
import useSupabaseSession from '@/hooks/useSupabaseSession'
import AddTaskDialog from '@/components/AddTaskDialog'
import AddClientDialog from '@/components/AddClientDialog'
import { toast } from 'sonner'

export default function TasksTab() {
    const session = useSupabaseSession()
    const [tasks, setTasks] = useState<Task[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const [activeFilter, setActiveFilter] = useState<'all' | 'due_today' | 'due_this_week' | 'overdue'>('all')
    const [selectedTask, setSelectedTask] = useState<Task | null>(null)
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)

    const fetchTasks = async () => {
        try {
            setLoading(true)
            const userId = session?.user?.id
            if (userId) {
                const tasksData = await DashboardService.getDueTasks(50, userId)
                setTasks(tasksData)
            } else {
                setTasks([])
            }
        } catch (error) {
            console.error('Error fetching tasks:', error)
            setTasks([])
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
            case 'pending':
                return <Badge variant="default" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    const handleEditTask = (task: Task) => {
        setSelectedTask(task)
        setShowEditDialog(true)
    }

    const handleDeleteTask = (task: Task) => {
        setSelectedTask(task)
        setShowDeleteDialog(true)
    }

    const confirmDeleteTask = async () => {
        if (!selectedTask || !session?.user?.id) return

        try {
            setDeleteLoading(true)
            const success = await DashboardService.deleteTask(selectedTask.id, session.user.id)

            if (success) {
                toast.success('Task deleted successfully')
                fetchTasks() // Refresh the tasks list
                setShowDeleteDialog(false)
                setSelectedTask(null)
            } else {
                toast.error('Failed to delete task')
            }
        } catch (error) {
            console.error('Error deleting task:', error)
            toast.error('Failed to delete task')
        } finally {
            setDeleteLoading(false)
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
                <div className="flex gap-2">

                    <AddTaskDialog onTaskAdded={fetchTasks} trigger={
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Task
                        </Button>
                    } />
                </div>
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
                                    <TableHead className="w-[70px]">Actions</TableHead>
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
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => handleEditTask(task)}
                                                        className="cursor-pointer"
                                                    >
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Edit Task
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteTask(task)}
                                                        className="cursor-pointer text-red-600 focus:text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete Task
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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
                                    <AddTaskDialog onTaskAdded={fetchTasks} trigger={
                                        <Button>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Task
                                        </Button>
                                    } />
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Edit Task Dialog */}
            {selectedTask && (
                <AddTaskDialog
                    onTaskAdded={() => {
                        fetchTasks()
                        setShowEditDialog(false)
                        setSelectedTask(null)
                    }}
                    editingTask={selectedTask}
                    isOpen={showEditDialog}
                    onOpenChange={setShowEditDialog}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Task</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{selectedTask?.title}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(false)}
                            disabled={deleteLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDeleteTask}
                            disabled={deleteLoading}
                        >
                            {deleteLoading ? 'Deleting...' : 'Delete Task'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
