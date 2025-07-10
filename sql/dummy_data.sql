-- Dummy data for ClientSync application
-- Replace 'your-user-id-here' with your actual Supabase user ID

-- First, insert dummy clients
INSERT INTO clients (id, name, email, company, phone, notes, user_id, created_at, updated_at) VALUES
('client-1', 'Sarah Johnson', 'sarah.johnson@techsolutions.com', 'Tech Solutions Inc.', '+1 (555) 123-4567', 'Initial consultation completed. Interested in web development services.', 'your-user-id-here', '2024-06-15T10:00:00Z', '2024-06-20T14:30:00Z'),
('client-2', 'Michael Chen', 'michael.chen@startupxyz.com', 'StartupXYZ', '+1 (555) 987-6543', 'Looking for mobile app development. Early-stage startup.', 'your-user-id-here', '2024-06-18T09:15:00Z', '2024-06-22T11:45:00Z'),
('client-3', 'Emily Rodriguez', 'emily.r@consulting.com', 'Rodriguez Consulting', '+1 (555) 456-7890', 'Requires custom CRM system. Mid-size company.', 'your-user-id-here', '2024-06-20T16:20:00Z', '2024-06-25T13:10:00Z'),
('client-4', 'David Thompson', 'david@retailstore.com', 'Thompson Retail', '+1 (555) 234-5678', 'E-commerce platform needed. Brick and mortar expanding online.', 'your-user-id-here', '2024-06-22T11:30:00Z', '2024-06-27T09:00:00Z'),
('client-5', 'Lisa Park', 'lisa.park@nonprofit.org', 'Community Nonprofit', '+1 (555) 345-6789', 'Website redesign project. Non-profit organization.', 'your-user-id-here', '2024-06-25T14:45:00Z', '2024-06-30T16:20:00Z'),
('client-6', 'Robert Kim', 'robert.kim@healthtech.com', 'HealthTech Solutions', '+1 (555) 678-9012', 'Healthcare management system. HIPAA compliance required.', 'your-user-id-here', '2024-06-28T13:20:00Z', '2024-07-02T10:15:00Z'),
('client-7', 'Maria Garcia', 'maria@educationplus.org', 'Education Plus', '+1 (555) 789-0123', 'Learning management platform for schools.', 'your-user-id-here', '2024-07-01T11:45:00Z', '2024-07-05T16:30:00Z'),
('client-8', 'James Wilson', 'james.wilson@financegroup.com', 'Wilson Finance Group', '+1 (555) 890-1234', 'Financial dashboard and reporting tools.', 'your-user-id-here', '2024-07-03T09:30:00Z', '2024-07-08T12:45:00Z');

-- Then, insert dummy tasks
INSERT INTO tasks (id, title, description, status, due_date, client_id, user_id, created_at, updated_at) VALUES
('task-1', 'Initial Project Consultation', 'Schedule and conduct initial consultation meeting with client to understand requirements', 'completed', '2024-07-15', 'client-1', 'your-user-id-here', '2024-07-01T10:00:00Z', '2024-07-05T14:30:00Z'),
('task-2', 'Create Project Proposal', 'Prepare detailed project proposal including timeline, budget, and deliverables', 'in_progress', '2024-07-20', 'client-1', 'your-user-id-here', '2024-07-05T09:15:00Z', '2024-07-10T11:45:00Z'),
('task-3', 'Mobile App Wireframes', 'Design initial wireframes for the mobile application user interface', 'pending', '2024-07-25', 'client-2', 'your-user-id-here', '2024-07-08T16:20:00Z', '2024-07-08T16:20:00Z'),
('task-4', 'Database Schema Design', 'Design database schema for the CRM system', 'pending', '2024-08-01', 'client-3', 'your-user-id-here', '2024-07-10T11:30:00Z', '2024-07-10T11:30:00Z'),
('task-5', 'E-commerce Platform Research', 'Research and recommend suitable e-commerce platforms', 'in_progress', '2024-07-18', 'client-4', 'your-user-id-here', '2024-07-02T14:45:00Z', '2024-07-08T16:20:00Z'),
('task-6', 'Website Content Audit', 'Review existing website content and identify areas for improvement', 'pending', '2024-07-22', 'client-5', 'your-user-id-here', '2024-07-09T08:00:00Z', '2024-07-09T08:00:00Z'),
('task-7', 'Contract Review', 'Review and finalize service contract terms', 'completed', '2024-07-12', 'client-2', 'your-user-id-here', '2024-06-28T10:00:00Z', '2024-07-02T15:30:00Z'),
('task-8', 'Payment Setup', 'Set up payment processing for online store', 'pending', '2024-08-05', 'client-4', 'your-user-id-here', '2024-07-05T12:00:00Z', '2024-07-05T12:00:00Z'),
('task-9', 'HIPAA Compliance Review', 'Review healthcare data handling requirements and compliance measures', 'pending', '2024-08-10', 'client-6', 'your-user-id-here', '2024-07-08T14:00:00Z', '2024-07-08T14:00:00Z'),
('task-10', 'LMS Feature Planning', 'Plan core features for the learning management system', 'in_progress', '2024-07-28', 'client-7', 'your-user-id-here', '2024-07-06T11:20:00Z', '2024-07-09T15:45:00Z'),
('task-11', 'Financial Dashboard Mockups', 'Create visual mockups for the financial dashboard interface', 'pending', '2024-08-15', 'client-8', 'your-user-id-here', '2024-07-09T13:30:00Z', '2024-07-09T13:30:00Z'),
('task-12', 'Security Assessment', 'Conduct security assessment for financial data handling', 'pending', '2024-08-20', 'client-8', 'your-user-id-here', '2024-07-10T09:45:00Z', '2024-07-10T09:45:00Z'),
('task-13', 'User Testing Plan', 'Develop user testing strategy for education platform', 'pending', '2024-08-03', 'client-7', 'your-user-id-here', '2024-07-07T16:10:00Z', '2024-07-07T16:10:00Z'),
('task-14', 'Healthcare API Integration', 'Research and plan integration with healthcare APIs', 'pending', '2024-08-12', 'client-6', 'your-user-id-here', '2024-07-09T10:25:00Z', '2024-07-09T10:25:00Z'),
('task-15', 'Final Presentation Prep', 'Prepare final project presentation for nonprofit client', 'pending', '2024-07-30', 'client-5', 'your-user-id-here', '2024-07-08T12:15:00Z', '2024-07-08T12:15:00Z');

-- Add some overdue tasks for testing
INSERT INTO tasks (id, title, description, status, due_date, client_id, user_id, created_at, updated_at) VALUES
('task-overdue-1', 'Overdue Task Example', 'This task is overdue for testing purposes', 'pending', '2024-07-05', 'client-1', 'your-user-id-here', '2024-06-25T10:00:00Z', '2024-06-25T10:00:00Z'),
('task-overdue-2', 'Another Overdue Task', 'Second overdue task for dashboard testing', 'in_progress', '2024-07-08', 'client-3', 'your-user-id-here', '2024-06-30T14:00:00Z', '2024-07-02T16:00:00Z');
