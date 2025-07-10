"use client";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Home, Users, CheckSquare, Settings, LogOut } from "lucide-react";
import useSupabaseSession from "../hooks/useSupabaseSession";
import supabase from "@/lib/supabaseClient";

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    children: React.ReactNode;
}

export default function SidebarNav({ activeTab, setActiveTab, children }: SidebarProps) {
    const session = useSupabaseSession();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        // Optional: redirect to home page
        window.location.href = "/";
    };

    const menuItems = [
        {
            title: "Dashboard",
            icon: Home,
            id: "dashboard",
        },
        {
            title: "Clients",
            icon: Users,
            id: "clients",
        },
        {
            title: "Tasks",
            icon: CheckSquare,
            id: "tasks",
        },
        {
            title: "Settings",
            icon: Settings,
            id: "settings",
        },
    ];

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <Sidebar>
                    <SidebarHeader className="p-4">
                        <div className="flex flex-col items-center space-y-2">
                            <Avatar className="w-16 h-16">
                                <AvatarImage src={session?.user?.user_metadata?.avatar_url || ""} />
                                <AvatarFallback>
                                    <User className="h-8 w-8" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="text-center">
                                <p className="font-semibold text-sm">{session?.user?.user_metadata?.full_name || session?.user?.user_metadata?.name || "User"}</p>
                                <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
                            </div>
                        </div>
                    </SidebarHeader>

                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {menuItems.map((item) => (
                                        <SidebarMenuItem key={item.id}>
                                            <SidebarMenuButton
                                                onClick={() => setActiveTab(item.id)}
                                                isActive={activeTab === item.id}
                                                className="w-full"
                                            >
                                                <item.icon className="w-4 h-4" />
                                                <span>{item.title}</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>

                    <SidebarFooter className="p-4">
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    onClick={handleLogout}
                                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Logout</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarFooter>
                </Sidebar>

                <main className="flex-1 overflow-hidden">
                    <div className="flex h-full flex-col">
                        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                            <SidebarTrigger />
                            <h1 className="text-lg font-semibold">User Dashboard</h1>
                        </header>
                        <div className="flex-1 overflow-auto p-4">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}