import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, Building2, Settings, LogOut } from 'lucide-react';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  activeTab: 'users' | 'hospitals';
  setActiveTab: (tab: 'users' | 'hospitals') => void;
}

export function Sidebar({ className, activeTab, setActiveTab }: SidebarProps) {
  return (
    <div className={cn("pb-12 w-64 border-r bg-card h-screen fixed left-0 top-0", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-primary flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5" />
            Sagar Health
          </h2>
          <div className="space-y-1">
            <Button
              variant={activeTab === 'hospitals' ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab('hospitals')}
            >
              <Building2 className="mr-2 h-4 w-4" />
              Hospitals
            </Button>
            <Button
              variant={activeTab === 'users' ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab('users')}
            >
              <Users className="mr-2 h-4 w-4" />
              Users
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>
      </div>
      <div className="absolute bottom-4 px-3 w-full">
         <Button variant="outline" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
         </Button>
      </div>
    </div>
  );
}
