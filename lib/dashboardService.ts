import supabase from './supabaseClient';
import { Client, Task, DashboardStats } from './types';

export class DashboardService {
    // Utility function to convert DD/MM/YYYY to YYYY-MM-DD
    private static convertDateFormat(dateString: string): string {
        // Check if already in YYYY-MM-DD format
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return dateString;
        }

        // Convert DD/MM/YYYY to YYYY-MM-DD
        if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
            const [day, month, year] = dateString.split('/');
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }

        throw new Error('Invalid date format. Please use DD/MM/YYYY or YYYY-MM-DD');
    }

    // Utility function to convert YYYY-MM-DD to DD/MM/YYYY for display
    private static convertDateForDisplay(dateString: string): string {
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month, day] = dateString.split('-');
            return `${day}/${month}/${year}`;
        }
        return dateString;
    }

    // Get dashboard statistics
    static async getDashboardStats(userId?: string): Promise<DashboardStats> {
        try {
            if (!userId) {
                return {
                    totalClients: 0,
                    activeClients: 0,
                    pendingTasks: 0,
                    overdueTasks: 0,
                    completedTasksThisWeek: 0
                };
            }

            // Auto-cleanup inactive clients and their tasks older than 30 days
            await this.cleanupInactiveClients(userId);

            // Get client statistics with status field
            const { data: clients, error: clientsError } = await supabase
                .from('clients')
                .select('id, status, created_at')
                .eq('user_id', userId);

            if (clientsError) throw clientsError;

            const totalClients = clients?.length || 0;
            const activeClients = clients?.filter(c => c.status === 'active').length || 0;

            // Get task statistics - selecting only necessary fields for performance
            const { data: tasks, error: tasksError } = await supabase
                .from('tasks')
                .select('status, due_date, created_at, updated_at')
                .eq('user_id', userId);

            if (tasksError) throw tasksError;

            const now = new Date();
            const today = now.toISOString().split('T')[0];
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

            // Count due tasks (non-completed tasks that are due today or overdue)
            const dueTasks = tasks?.filter(t =>
                (t.status === 'pending' || t.status === 'in_progress') &&
                new Date(t.due_date).toISOString().split('T')[0] <= today
            ).length || 0;

            // Count overdue tasks (non-completed tasks past due date)
            const overdueTasks = tasks?.filter(t =>
                (t.status === 'pending' || t.status === 'in_progress') &&
                new Date(t.due_date).toISOString().split('T')[0] < today
            ).length || 0;

            const completedTasksThisWeek = tasks?.filter(t =>
                t.status === 'completed' &&
                new Date(t.updated_at) >= weekAgo // ✅ When task was completed, not created
            ).length || 0;

            return {
                totalClients,
                activeClients,
                pendingTasks: dueTasks, // Now represents due tasks instead of just pending
                overdueTasks,
                completedTasksThisWeek
            };
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            return {
                totalClients: 0,
                activeClients: 0,
                pendingTasks: 0,
                overdueTasks: 0,
                completedTasksThisWeek: 0
            };
        }
    }

    // Get recent clients
    static async getRecentClients(limit: number = 3, userId?: string): Promise<Client[]> {
        try {
            if (!userId) return [];

            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching recent clients:', error);
            return [];
        }
    }

    // Get due tasks
    static async getDueTasks(limit: number = 10, userId?: string): Promise<Task[]> {
        try {
            if (!userId) return [];

            const { data, error } = await supabase
                .from('tasks')
                .select(`
          *,
          clients (
            id,
            name,
            email,
            company
          )
        `)
                .eq('user_id', userId)
                .not('status', 'eq', 'completed')
                .order('due_date', { ascending: true })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching due tasks:', error);
            return [];
        }
    }

    // Get overdue tasks
    static async getOverdueTasks(userId?: string): Promise<Task[]> {
        try {
            if (!userId) return [];

            const now = new Date().toISOString().split('T')[0]; // Get date in YYYY-MM-DD format
            const { data, error } = await supabase
                .from('tasks')
                .select(`
          *,
          clients (
            id,
            name,
            email,
            company
          )
        `)
                .eq('user_id', userId)
                .not('status', 'eq', 'completed')
                .lt('due_date', now)
                .order('due_date', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching overdue tasks:', error);
            return [];
        }
    }

    // Client Management Methods

    // Get all clients for a user
    static async getAllClients(userId?: string): Promise<Client[]> {
        try {
            if (!userId) return [];

            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching all clients:', error);
            return [];
        }
    }

    // Get active clients only
    static async getActiveClients(userId?: string): Promise<Client[]> {
        try {
            if (!userId) return [];

            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .eq('user_id', userId)
                .eq('status', 'active')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching active clients:', error);
            return [];
        }
    }

    // Create a new client
    static async createClient(clientData: {
        name: string;
        email: string;
        company: string;
        phone?: string;
        notes?: string;
        status: 'active' | 'inactive';
        userId: string;
    }): Promise<Client> {
        try {
            const { data, error } = await supabase
                .from('clients')
                .insert([
                    {
                        name: clientData.name,
                        email: clientData.email,
                        company: clientData.company || null,
                        phone: clientData.phone || null,
                        notes: clientData.notes || null,
                        status: clientData.status || 'active', // Default to active
                        user_id: clientData.userId,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                ])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating client:', error);
            throw error;
        }
    }

    // Update a client
    static async updateClient(clientId: string, clientData: Partial<Client>, userId: string): Promise<Client | null> {
        try {
            const { data, error } = await supabase
                .from('clients')
                .update(clientData)
                .eq('id', clientId)
                .eq('user_id', userId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating client:', error);
            return null;
        }
    }

    // Delete a client
    static async deleteClient(clientId: string, userId: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('clients')
                .delete()
                .eq('id', clientId)
                .eq('user_id', userId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting client:', error);
            return false;
        }
    }

    // Get client by ID
    static async getClientById(clientId: string, userId: string): Promise<Client | null> {
        try {
            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .eq('id', clientId)
                .eq('user_id', userId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching client:', error);
            return null;
        }
    }

    // Search clients
    static async searchClients(searchTerm: string, userId: string): Promise<Client[]> {
        try {
            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .eq('user_id', userId)
                .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%`)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error searching clients:', error);
            return [];
        }
    }

    // Task Management Methods

    // Get all tasks for a user
    static async getAllTasks(userId?: string): Promise<Task[]> {
        try {
            if (!userId) return [];

            const { data, error } = await supabase
                .from('tasks')
                .select(`
          *,
          clients (
            id,
            name,
            email,
            company
          )
        `)
                .eq('user_id', userId)
                .order('due_date', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching all tasks:', error);
            return [];
        }
    }

    // Create a new task (optimized for frontend forms)
    static async createTask(taskData: {
        title: string;
        description?: string;
        client_id: string;
        due_date: string; // Accepts DD/MM/YYYY format
        status?: 'pending' | 'in_progress' | 'completed';
        userId: string;
    }): Promise<Task> {
        try {
            const { data, error } = await supabase
                .from('tasks')
                .insert([
                    {
                        title: taskData.title,
                        description: taskData.description || null,
                        client_id: taskData.client_id,
                        due_date: this.convertDateFormat(taskData.due_date), // Convert to YYYY-MM-DD
                        status: taskData.status || 'pending',
                        user_id: taskData.userId,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                ])
                .select(`
                    *,
                    clients (
                        id,
                        name,
                        email,
                        company
                    )
                `)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating task:', error);
            throw error;
        }
    }

    // Update a task
    static async updateTask(taskId: string, taskData: Partial<Task>, userId: string): Promise<Task | null> {
        try {
            const { data, error } = await supabase
                .from('tasks')
                .update(taskData)
                .eq('id', taskId)
                .eq('user_id', userId)
                .select(`
          *,
          clients (
            id,
            name,
            email,
            company
          )
        `)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating task:', error);
            return null;
        }
    }

    // Delete a task
    static async deleteTask(taskId: string, userId: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', taskId)
                .eq('user_id', userId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting task:', error);
            return false;
        }
    }

    // Get tasks by status
    static async getTasksByStatus(status: string, userId: string): Promise<Task[]> {
        try {
            const { data, error } = await supabase
                .from('tasks')
                .select(`
          *,
          clients (
            id,
            name,
            email,
            company
          )
        `)
                .eq('user_id', userId)
                .eq('status', status)
                .order('due_date', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching tasks by status:', error);
            return [];
        }
    }

    // Get tasks due today
    static async getTasksDueToday(userId: string): Promise<Task[]> {
        try {
            const today = new Date().toISOString().split('T')[0];
            const { data, error } = await supabase
                .from('tasks')
                .select(`
          *,
          clients (
            id,
            name,
            email,
            company
          )
        `)
                .eq('user_id', userId)
                .eq('due_date', today)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching tasks due today:', error);
            return [];
        }
    }

    // Get tasks due this week
    static async getTasksDueThisWeek(userId: string): Promise<Task[]> {
        try {
            const today = new Date();
            const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

            const todayStr = today.toISOString().split('T')[0];
            const weekFromNowStr = weekFromNow.toISOString().split('T')[0];

            const { data, error } = await supabase
                .from('tasks')
                .select(`
          *,
          clients (
            id,
            name,
            email,
            company
          )
        `)
                .eq('user_id', userId)
                .gte('due_date', todayStr)
                .lte('due_date', weekFromNowStr)
                .order('due_date', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching tasks due this week:', error);
            return [];
        }
    }

    // Get pending tasks (status = 'pending' only)
    static async getPendingTasks(limit: number = 3, userId?: string): Promise<Task[]> {
        try {
            if (!userId) return [];

            const { data, error } = await supabase
                .from('tasks')
                .select(`
          *,
          clients (
            id,
            name,
            email,
            company
          )
        `)
                .eq('user_id', userId)
                .eq('status', 'pending')
                .order('due_date', { ascending: true })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching pending tasks:', error);
            return [];
        }
    }

    // Search tasks
    static async searchTasks(searchTerm: string, userId: string): Promise<Task[]> {
        try {
            const { data, error } = await supabase
                .from('tasks')
                .select(`
          *,
          clients (
            id,
            name,
            email,
            company
          )
        `)
                .eq('user_id', userId)
                .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
                .order('due_date', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error searching tasks:', error);
            return [];
        }
    }

    // Settings and Profile Management Methods

    // Get user profile
    static async getUserProfile(userId: string): Promise<any> {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return data;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }
    }

    // Update user profile
    static async updateUserProfile(userId: string, profileData: any): Promise<any> {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .upsert({
                    id: userId,
                    ...profileData,
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating user profile:', error);
            return null;
        }
    }

    // Upload avatar image
    static async uploadAvatar(userId: string, file: File): Promise<string | null> {
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${userId}-${Date.now()}.${fileExt}`
            const filePath = `avatars/${fileName}`

            // Upload file to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            return publicUrl
        } catch (error) {
            console.error('Error uploading avatar:', error)
            return null
        }
    }

    // Update user password
    static async updatePassword(userId: string, newPassword: string): Promise<boolean> {
        try {
            // Get current user to ensure they're updating their own password
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError || !user || user.id !== userId) {
                throw new Error('Unauthorized password update attempt');
            }

            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error updating password:', error);
            return false;
        }
    }

    // Clear completed tasks
    static async clearCompletedTasks(userId: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('user_id', userId)
                .eq('status', 'completed');

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error clearing completed tasks:', error);
            return false;
        }
    }

    // Get account statistics
    static async getAccountStatistics(userId: string): Promise<any> {
        try {
            const [clients, tasks] = await Promise.all([
                this.getAllClients(userId),
                this.getAllTasks(userId)
            ]);

            const activeClients = clients?.filter(c => c.status === 'active').length || 0;
            const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;
            const activeTasks = tasks?.filter(t => t.status !== 'completed').length || 0;

            return {
                total_clients: clients?.length || 0,
                active_clients: activeClients, // Added active clients count
                total_tasks: tasks?.length || 0,
                completed_tasks: completedTasks,
                active_tasks: activeTasks,
                completion_rate: tasks?.length ? Math.round((completedTasks / tasks.length) * 100) : 0
            };
        } catch (error) {
            console.error('Error getting account statistics:', error);
            return {
                total_clients: 0,
                active_clients: 0,
                total_tasks: 0,
                completed_tasks: 0,
                active_tasks: 0,
                completion_rate: 0
            };
        }
    }

    // Delete user account (be very careful with this)
    // Auto-cleanup inactive clients and their related tasks after 30 days
    static async cleanupInactiveClients(userId: string): Promise<void> {
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const cutoffDate = thirtyDaysAgo.toISOString();

            // Find inactive clients older than 30 days
            const { data: inactiveClients, error: clientsError } = await supabase
                .from('clients')
                .select('id')
                .eq('user_id', userId)
                .eq('status', 'inactive')
                .lt('updated_at', cutoffDate);

            if (clientsError) {
                console.error('Error fetching inactive clients for cleanup:', clientsError);
                return;
            }

            if (!inactiveClients || inactiveClients.length === 0) {
                return; // No clients to cleanup
            }

            const clientIds = inactiveClients.map(c => c.id);

            // Delete tasks related to these clients first (due to foreign key constraints)
            const { error: tasksError } = await supabase
                .from('tasks')
                .delete()
                .in('client_id', clientIds);

            if (tasksError) {
                console.error('Error deleting tasks during cleanup:', tasksError);
                return;
            }

            // Then delete the inactive clients
            const { error: deleteError } = await supabase
                .from('clients')
                .delete()
                .in('id', clientIds);

            if (deleteError) {
                console.error('Error deleting inactive clients:', deleteError);
                return;
            }

            console.log(`Cleaned up ${clientIds.length} inactive clients and their related tasks.`);
        } catch (error) {
            console.error('Error during cleanup process:', error);
        }
    }

    // Manually trigger cleanup of inactive clients (can be called from admin interface)
    static async triggerCleanup(userId: string): Promise<{ success: boolean; message: string; deletedCount: number }> {
        try {
            // Find ALL inactive clients (regardless of age)
            const { data: inactiveClients, error: clientsError } = await supabase
                .from('clients')
                .select('id, name')
                .eq('user_id', userId)
                .eq('status', 'inactive');

            if (clientsError) {
                return { success: false, message: 'Error fetching inactive clients', deletedCount: 0 };
            }

            if (!inactiveClients || inactiveClients.length === 0) {
                return { success: true, message: 'No inactive clients found for cleanup', deletedCount: 0 };
            }

            const clientIds = inactiveClients.map(c => c.id);

            // Delete tasks related to these clients first (due to foreign key constraints)
            const { error: tasksError } = await supabase
                .from('tasks')
                .delete()
                .in('client_id', clientIds);

            if (tasksError) {
                console.error('Error deleting tasks for inactive clients:', tasksError);
                return { success: false, message: 'Error deleting related tasks', deletedCount: 0 };
            }

            // Delete the inactive clients
            const { error: deleteError } = await supabase
                .from('clients')
                .delete()
                .in('id', clientIds);

            if (deleteError) {
                console.error('Error deleting inactive clients:', deleteError);
                return { success: false, message: 'Error deleting inactive clients', deletedCount: 0 };
            }

            return {
                success: true,
                message: `Successfully cleaned up ${inactiveClients.length} inactive clients and their related tasks`,
                deletedCount: inactiveClients.length
            };
        } catch (error) {
            console.error('Error in triggerCleanup:', error);
            return { success: false, message: 'Unexpected error during cleanup', deletedCount: 0 };
        }
    }
}
