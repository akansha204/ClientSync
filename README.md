# ClientSync

ClientSync is a modern web application built to help professionals manage their clients and tasks efficiently. Built with Next.js 13+ and Supabase, it offers a robust platform for client relationship management and task tracking.

## Features

- **Authentication**
  - Secure user authentication powered by Supabase
  - Password reset functionality
  - Protected routes and dashboard

- **Client Management**
  - Add and manage client information
  - Track client details including name, email, company, and status
  - Comprehensive client overview
- **Task Management**
  - Create and assign tasks to specific clients
  - Track task status (pending, in progress, completed)
  - Due date management
  - Task filtering and search capabilities

- **Dashboard**
  - User-friendly interface
  - Quick overview of pending tasks
  - Client statistics
  - Task status visualization

- **User Experience**
  - Dark/Light theme support
  - Responsive design
  - Real-time updates
  - Modern UI components using Shadcn/ui

## Tech Stack

- **Frontend**
  - Next.js 13+
  - TypeScript
  - Tailwind CSS
  - Shadcn/ui Components
- **Backend**
  - Supabase (Database & Authentication)
  - Next.js API Routes
## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/akansha204/ClientSync.git
   cd ClientSync
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```
Built with ❤️ using Next.js and Supabase
