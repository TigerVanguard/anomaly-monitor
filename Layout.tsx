import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Activity, 
  Radar, 
  Search, 
  Settings, 
  Bell,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Anomaly Detection", path: "/anomalies", icon: Activity },
    { name: "Insider Radar", path: "/radar", icon: Radar },
    { name: "Market Scanner", path: "/scanner", icon: Search },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground overflow-hidden flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <img src="/images/logo.png" alt="Logo" className="w-8 h-8" />
          <span className="font-mono font-bold text-lg tracking-tighter text-primary">ANOMALY.MONITOR</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-muted-foreground hover:text-primary">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-sidebar-border flex items-center gap-3">
          <img src="/images/logo.png" alt="Logo" className="w-10 h-10" />
          <div>
            <h1 className="font-mono font-bold text-xl tracking-tighter text-primary leading-none">ANOMALY</h1>
            <span className="text-xs text-muted-foreground tracking-widest">MONITOR SYSTEM</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <div className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-none border-l-2 transition-all duration-200 group cursor-pointer",
                  isActive 
                    ? "border-primary bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 hover:border-sidebar-border"
                )}>
                  <Icon className={cn("w-5 h-5", isActive && "text-primary drop-shadow-[0_0_5px_rgba(0,255,65,0.5)]")} />
                  <span className="font-mono text-sm uppercase tracking-wider">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="bg-card/50 p-4 border border-border rounded-none relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-mono">SYSTEM STATUS</span>
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_var(--color-primary)]" />
            </div>
            <div className="font-mono text-xs space-y-1 text-muted-foreground">
              <div className="flex justify-between">
                <span>CPU</span>
                <span className="text-primary">12%</span>
              </div>
              <div className="flex justify-between">
                <span>MEM</span>
                <span className="text-primary">4.2GB</span>
              </div>
              <div className="flex justify-between">
                <span>NET</span>
                <span className="text-primary">1.2MB/s</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-[calc(100vh-64px)] md:h-screen overflow-hidden relative">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[url('/images/dashboard_bg.jpg')] bg-cover bg-center opacity-20 mix-blend-screen" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[1] bg-[length:100%_2px,3px_100%] pointer-events-none" />
        </div>

        {/* Header */}
        <header className="h-16 border-b border-border bg-background/50 backdrop-blur-md flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="font-mono text-lg font-bold text-foreground uppercase tracking-widest">
              {navItems.find(i => i.path === location)?.name || "Dashboard"}
            </h2>
            <div className="h-4 w-[1px] bg-border" />
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <span className="w-2 h-2 bg-primary rounded-full" />
              LIVE FEED ACTIVE
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Bell className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full animate-pulse" />
            </div>
            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-foreground">OPERATOR</div>
                <div className="text-xs text-muted-foreground font-mono">ID: 892-ALPHA</div>
              </div>
              <div className="w-8 h-8 bg-primary/20 border border-primary rounded-none flex items-center justify-center text-primary font-bold font-mono">
                OP
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 z-10 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
          {children}
        </div>
      </main>
    </div>
  );
}
