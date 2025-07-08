
import { ReactNode } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  Package, 
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar
} from './ui/sidebar';

interface AdminLayoutProps {
  children: ReactNode;
}

const adminMenuItems = [
  { title: 'Dashboard', url: '/admin', icon: BarChart3 },
  { title: 'Products', url: '/admin/products', icon: Package },
  { title: 'Orders', url: '/admin/orders', icon: ShoppingCart },
  { title: 'Customers', url: '/admin/customers', icon: Users },
  { title: 'Settings', url: '/admin/settings', icon: Settings },
];

function AdminSidebar() {
  const { state } = useSidebar();
  const { user, logout } = useAuth();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg">
              <Settings className="h-6 w-6 text-primary-foreground" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="font-bold text-lg">Admin Panel</h2>
                <p className="text-xs text-muted-foreground">ShopHub Management</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link 
                      to={item.url} 
                      className={isActive(item.url) ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted/50"}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-4 border-t">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex-1">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="mt-4">
            <Link to="/">
              <Button variant="outline" size="sm" className="w-full">
                <Home className="mr-2 h-4 w-4" />
                {!isCollapsed && "Back to Store"}
              </Button>
            </Link>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user } = useAuth();

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center border-b bg-background/95 backdrop-blur px-4">
            <SidebarTrigger />
            <h1 className="ml-4 font-semibold">Admin Dashboard</h1>
          </header>
          
          <main className="flex-1 p-6 bg-muted/30">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
