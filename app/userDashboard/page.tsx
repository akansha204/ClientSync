"use client";
import DashboardTab from "@/components/DashboardItems/DashboardTab";
import ClientsTab from "@/components/DashboardItems/ClientsTab";
import TasksTab from "@/components/DashboardItems/TasksTab";
import SidebarNav from "@/components/Sidebar-nav";
import { useState } from "react";

export default function Page() {
    const [activeTab, setActiveTab] = useState('dashboard');

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <DashboardTab />;
            case 'clients':
                return <ClientsTab />;
            case 'tasks':
                return <TasksTab />;
            default:
                return <DashboardTab />;
        }
    };
    return (
        <SidebarNav activeTab={activeTab} setActiveTab={setActiveTab}>
            {renderContent()}
        </SidebarNav>
    );
}
