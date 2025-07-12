"use client"
import React, { useState, useEffect } from 'react'
import { Users, CheckSquare, Clock, AlertTriangle, Calendar, TrendingUp } from 'lucide-react'
import { StatsCard } from '@/components/ui/stats-card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { DashboardService } from '@/lib/dashboardService'
import { DashboardStats, Client, Task, FollowUp } from '@/lib/types'
import useSupabaseSession from '@/hooks/useSupabaseSession'
import AddClientDialog from '@/components/AddClientDialog'
import AddTaskDialog from '@/components/AddTaskDialog'
export default function DashboardTab() {
    const session = useSupabaseSession()
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [recentClients, setRecentClients] = useState<Client[]>([])
    const [dueTasks, setDueTasks] = useState<Task[]>([])
    const [recentFollowUps, setRecentFollowUps] = useState<FollowUp[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const fetchDashboardData = async () => {
        try {
            setRefreshing(true)
            const userId = session?.user?.id

            const [statsData, clientsData, tasksData, followUpsData] = await Promise.all([
                DashboardService.getDashboardStats(userId),
                DashboardService.getRecentClients(5, userId),
                DashboardService.getDueTasks(8, userId),
                DashboardService.getRecentFollowUps(5, userId)
            ])

            setStats(statsData)
            setRecentClients(clientsData)
            setDueTasks(tasksData)
            setRecentFollowUps(followUpsData)
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        if (session) {
            fetchDashboardData()
        }
    }, [session])

    const getTaskStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed': return 'text-green-600 bg-green-50'
            case 'in_progress':
            case 'in progress': return 'text-blue-600 bg-blue-50'
            case 'pending':
            default: return 'text-gray-600 bg-gray-50'
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffTime = date.getTime() - now.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 0) return 'Today'
        if (diffDays === 1) return 'Tomorrow'
        if (diffDays === -1) return 'Yesterday'
        if (diffDays < 0) return `${Math.abs(diffDays)} days ago`
        if (diffDays <= 7) return `In ${diffDays} days`

        return date.toLocaleDateString()
    }

    const isOverdue = (dueDate: string) => {
        return new Date(dueDate) < new Date()
    }

    if (loading) {
        return (
            <div className="space-y-6 p-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {Array(4).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {Array(3).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-80" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Welcome back! Here's what's happening with your clients.
                    </p>
                </div>
                <Button
                    onClick={fetchDashboardData}
                    disabled={refreshing}
                    variant="outline"
                >
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Clients"
                    value={stats?.totalClients || 0}
                    description={`${stats?.activeClients || 0} total clients`}
                    icon={<Users className="h-4 w-4" />}
                />
                <StatsCard
                    title="Overdue Tasks"
                    value={stats?.overdueTasks || 0}
                    description={`${stats?.overdueTasks || 0} overdue`}
                    icon={<CheckSquare className="h-4 w-4" />}
                />
                {/* <StatsCard
                    title="Upcoming Follow-ups"
                    value={stats?.upcomingFollowUps || 0}
                    description="Next 30 days"
                    icon={<Calendar className="h-4 w-4" />}
                /> */}
                <StatsCard
                    title="Completed This Week"
                    value={stats?.completedTasksThisWeek || 0}
                    description="Tasks completed"
                    icon={<TrendingUp className="h-4 w-4" />}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Recent Clients */}
                <div className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Recent Clients</h3>
                        <Users className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="space-y-3">
                        {recentClients.length > 0 ? (
                            recentClients.map((client) => (
                                <div key={client.id} className="flex items-center justify-between p-3 bg-background rounded-md">
                                    <div className="flex-1">
                                        <p className="font-medium">{client.name}</p>
                                        <p className="text-sm text-muted-foreground">{client.email}</p>
                                        {client.company && (
                                            <p className="text-xs text-muted-foreground">{client.company}</p>
                                        )}
                                    </div>
                                    <div className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                        Active
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground text-center py-4">No recent clients</p>
                        )}
                    </div>
                </div>

                {/* Due Tasks */}
                <div className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Pending Tasks</h3>
                        <CheckSquare className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {dueTasks.length > 0 ? (
                            dueTasks.map((task) => (
                                <div key={task.id} className="p-3 bg-background rounded-md">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="font-medium">{task.title}</p>
                                            <p className="text-sm text-muted-foreground">{task.clients?.name}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className={`px-2 py-1 rounded-full text-xs ${getTaskStatusColor(task.status)}`}>
                                                    {task.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-xs ${isOverdue(task.due_date) ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                                                {formatDate(task.due_date)}
                                            </p>
                                            {isOverdue(task.due_date) && (
                                                <div className="flex items-center text-red-600 text-xs mt-1">
                                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                                    Overdue
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground text-center py-4">No due tasks</p>
                        )}
                    </div>
                </div>

                {/* Recent Follow-ups */}
                {/* <div className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Upcoming Follow-ups</h3>
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="space-y-3">
                        {recentFollowUps.length > 0 ? (
                            recentFollowUps.map((followUp) => (
                                <div key={followUp.id} className="p-3 bg-background rounded-md">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="font-medium">{followUp.subject}</p>
                                            <p className="text-sm text-muted-foreground">{followUp.clients?.name}</p>
                                            <div className="mt-2">
                                                <span className={`px-2 py-1 rounded-full text-xs ${followUp.type === 'call'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : followUp.type === 'email'
                                                        ? 'bg-green-100 text-green-800'
                                                        : followUp.type === 'meeting'
                                                            ? 'bg-purple-100 text-purple-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {followUp.type}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(followUp.scheduled_date)}
                                            </p>
                                            <div className="flex items-center text-blue-600 text-xs mt-1">
                                                <Clock className="h-3 w-3 mr-1" />
                                                Scheduled
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground text-center py-4">No upcoming follow-ups</p>
                        )}
                    </div>
                </div> */}
            </div>

            {/* Quick Actions */}
            <div className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm min-w-full">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-2">
                    <AddClientDialog onClientAdded={fetchDashboardData} />
                    <AddTaskDialog onTaskAdded={fetchDashboardData} />
                    {/* <Button className="h-auto p-4 flex-col gap-2" variant="outline">
                        <Calendar className="h-6 w-6" />
                        <span>Schedule Follow-up</span>
                    </Button>
                    <Button className="h-auto p-4 flex-col gap-2" variant="outline">
                        <TrendingUp className="h-6 w-6" />
                        <span>View Reports</span>
                    </Button> */}
                </div>
            </div>
        </div>
    )
}

