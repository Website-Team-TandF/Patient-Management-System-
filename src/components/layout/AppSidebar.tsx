import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, LogOut, Calendar, type LucideIcon } from 'lucide-react';

export interface SidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface AppSidebarProps {
  brandName?: string;
  brandIcon?: LucideIcon;
  menuItems: SidebarItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onLogout?: () => void;
  className?: string;
}

export function AppSidebar({ 
  brandName = 'Ayurvishwa Health',
  brandIcon: BrandIcon = LayoutDashboard,
  menuItems, 
  activeTab, 
  onTabChange,
  onLogout,
  className 
}: AppSidebarProps) {
  const navigate = useNavigate();

  return (
    <div className={cn("pb-12 w-64 border-r bg-card h-screen fixed left-0 top-0", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-primary flex items-center gap-2">
            <BrandIcon className="h-5 w-5" />
            {brandName}
          </h2>
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => onTabChange(item.id)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="absolute bottom-4 px-3 w-full space-y-2">
        <Button 
          variant="outline" 
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
