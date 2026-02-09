import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { 
  LogOut, 
  FileText, 
  PlusCircle,
  Zap,
  ChevronRight,
  Trash2
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";

const LOGO_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/maXyrLOUeJCvTJgW.png";

const menuItems = [
  { icon: PlusCircle, label: "New Proposal", path: "/proposals/new" },
  { icon: FileText, label: "Bills and Photos", path: "/proposals" },
  { icon: Trash2, label: "Bin", path: "/proposals/bin" },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 260;
const MIN_WIDTH = 200;
const MAX_WIDTH = 400;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-4">
            <img 
              src={LOGO_URL} 
              alt="Lightning Energy" 
              className="h-20 w-20"
            />
            <h1 className="text-3xl tracking-tight text-center" style={{ fontFamily: "'NextSphere', sans-serif", fontWeight: 800 }}>
              <span style={{ color: '#00EAD3' }}>Lightning Energy</span>
            </h1>
            <p className="text-sm uppercase tracking-[0.2em] text-center" style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 600, color: '#808285' }}>
              Proposal Generator
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-4 w-full">
            <p className="text-sm text-center max-w-sm" style={{ fontFamily: "'GeneralSans', sans-serif", color: '#808285' }}>
              Sign in to create professional electrification proposals for your customers.
            </p>
            <Button
              onClick={() => {
                window.location.href = getLoginUrl();
              }}
              size="lg"
              className="w-full font-semibold"
              style={{
                fontFamily: "'Urbanist', sans-serif",
                backgroundColor: '#00EAD3',
                color: '#000000',
                boxShadow: '0 0 20px rgba(0,234,211,0.3)'
              }}
            >
              <Zap className="mr-2 h-5 w-5" />
              Sign in to Continue
            </Button>
          </div>
          
          <p className="text-[10px] text-center mt-8" style={{ fontFamily: "'GeneralSans', sans-serif", color: '#808285' }}>
            © Lightning Energy — Architect George Fotopoulos
          </p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeMenuItem = menuItems.find(item => 
    item.path === "/proposals" 
      ? location === "/proposals" || (location.startsWith("/proposals/") && !location.startsWith("/proposals/new") && !location.startsWith("/proposals/bin"))
      : location.startsWith(item.path)
  );
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r border-border"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-16 justify-center border-b border-border">
            <div className="flex items-center gap-3 px-2 transition-all w-full">
              <button
                onClick={() => setLocation("/proposals/new")}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none"
              >
                <img 
                  src={LOGO_URL} 
                  alt="Lightning Energy" 
                  className="h-8 w-8 shrink-0"
                />
                {!isCollapsed && (
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm tracking-tight truncate" style={{ fontFamily: "'NextSphere', sans-serif", fontWeight: 800, color: '#00EAD3' }}>
                      Lightning Energy
                    </span>
                    <span className="text-[10px] truncate" style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 600, color: '#808285' }}>
                      Proposal Generator
                    </span>
                  </div>
                )}
              </button>
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0 py-4">
            <SidebarMenu className="px-2">
              {menuItems.map(item => {
                const isActive = item.path === "/proposals"
                  ? location === "/proposals" || (location.startsWith("/proposals/") && !location.startsWith("/proposals/new") && !location.startsWith("/proposals/bin"))
                  : location.startsWith(item.path);
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setLocation(item.path)}
                      tooltip={item.label}
                      className={`h-11 transition-all ${
                        isActive 
                          ? "bg-primary/10 text-primary border-l-2 border-primary" 
                          : "hover:bg-muted"
                      }`}
                      style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 600 }}
                    >
                      <item.icon
                        className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                      />
                      <span>{item.label}</span>
                      {isActive && !isCollapsed && (
                        <ChevronRight className="ml-auto h-4 w-4 text-primary" />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-3 border-t border-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-9 w-9 border border-primary/30 shrink-0">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary" style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 600 }}>
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm truncate leading-none" style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 600, color: '#FFFFFF' }}>
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs truncate mt-1" style={{ fontFamily: "'GeneralSans', sans-serif", color: '#808285' }}>
                      {user?.email || "-"}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-2">
                  <p className="text-sm" style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 600 }}>{user?.name}</p>
                  <p className="text-xs" style={{ fontFamily: "'GeneralSans', sans-serif", color: '#808285' }}>{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                  style={{ fontFamily: "'Urbanist', sans-serif" }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {!isCollapsed && (
              <p className="text-[9px] text-center mt-3 px-2" style={{ fontFamily: "'GeneralSans', sans-serif", color: '#808285' }}>
                © Lightning Energy
              </p>
            )}
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/30 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset className="bg-background">
        {isMobile && (
          <div className="flex border-b border-border h-14 items-center justify-between bg-sidebar px-4 sticky top-0 z-40">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="h-9 w-9 rounded-lg" />
              <div className="flex items-center gap-2">
                <img 
                  src={LOGO_URL} 
                  alt="Lightning Energy" 
                  className="h-6 w-6"
                />
                <span className="text-sm" style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 600, color: '#00EAD3' }}>
                  {activeMenuItem?.label ?? "Bills and Photos"}
                </span>
              </div>
            </div>
          </div>
        )}
        <main className="flex-1 p-6 overflow-auto scrollbar-thin">{children}</main>
      </SidebarInset>
    </>
  );
}
