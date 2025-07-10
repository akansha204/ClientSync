// Database types for the ClientSync application matching Supabase schema
export interface Client {
    id: string;
    name: string;
    email: string;
    company?: string;
    phone?: string;
    notes?: string;
    status: 'active' | 'inactive'; // Client status field
    user_id: string;
    created_at: string;
    updated_at: string;
}

export interface Task {
    id: string;
    title: string;
    description?: string;
    status: string; // This will be your task_status enum from Supabase
    due_date: string;
    client_id: string;
    user_id: string;
    created_at: string;
    updated_at: string;
    // Joined data
    clients?: Client;
}

// Future follow-ups table (create this table later if needed)
export interface FollowUp {
    id: string;
    client_id: string;
    user_id: string;
    type: 'call' | 'email' | 'meeting' | 'other';
    subject: string;
    notes?: string;
    scheduled_date: string;
    completed: boolean;
    created_at: string;
    updated_at: string;
    // Joined data
    clients?: Client;
}

export interface DashboardStats {
    totalClients: number;
    activeClients: number;
    pendingTasks: number;
    overdueTasks: number;
    upcomingFollowUps: number;
    completedTasksThisWeek: number;
}
