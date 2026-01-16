import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Zap,
  Activity,
  DollarSign,
  Users,
  Clock,
  Twitter,
  Globe,
  ExternalLink,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Terminal,
  Cpu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAnomalyData, Alert } from "@/hooks/useAnomalyData";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Home() {
  const { alerts, isLoading } = useAnomalyData();
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  // Stats calculation
  const totalVolume = alerts.reduce((acc, curr) => acc + curr.value, 0);
  const activeCount = alerts.length;
  const highConfCount = alerts.filter(a => a.value > 50000).length;

  return (
    <div className="space-y-6 min-h-screen bg-transparent">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="DETECTED VOLUME (24H)"
          value={`$${totalVolume.toLocaleString()}`}
          change="LIVE"
          isPositive={true}
          icon={DollarSign}
        />
        <StatCard
          title="ACTIVE ANOMALIES"
          value={`${activeCount} EVENTS`}
          change={`${alerts.length > 0 ? '+' + alerts.length : '0'}`}
          isPositive={false}
          icon={AlertTriangle}
          alert={activeCount > 5}
        />
        <StatCard
          title="WHALE MOVEMENTS"
          value={`${highConfCount} DETECTED`}
          change="HIGH VALUE"
          isPositive={true}
          icon={Zap}
        />
        <StatCard
          title="SYSTEM STATUS"
          value="OPERATIONAL"
          change="99.9% UPTIME"
          isPositive={true}
          icon={Cpu}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Main Chart Area - Heatmap */}
        <Card className="lg:col-span-2 bg-card/40 backdrop-blur-md border-border/50 shadow-2xl relative overflow-hidden flex flex-col">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 z-10">
            <CardTitle className="text-sm font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Market Anomaly Heatmap
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline" className="font-mono text-xs bg-primary/10 text-primary border-primary/20 animate-pulse">LIVE</Badge>
              <Badge variant="secondary" className="font-mono text-xs">GLOBAL</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 relative z-10 p-0 flex flex-col justify-end">
            {/* Visualization of Volume Distribution */}
            <div className="w-full h-full flex items-end justify-between px-4 pb-4 gap-1">
              {alerts.slice(0, 50).map((alert, i) => {
                const height = Math.min(100, Math.max(10, (alert.value / 100000) * 100)); // Normalize height
                const isBid = alert.message.includes("BID");
                return (
                  <motion.div
                    key={alert.id}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: `${height}%`, opacity: 1 }}
                    transition={{ duration: 0.5, delay: i * 0.02 }}
                    className={cn(
                      "w-full rounded-t-sm transition-all duration-300 hover:opacity-100 hover:shadow-[0_0_15px_currentColor]",
                      isBid ? "bg-emerald-500/50 hover:bg-emerald-400" : "bg-rose-500/50 hover:bg-rose-400",
                      alert.value > 50000 && "bg-violet-500/60 shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                    )}
                    title={`${alert.market_question} - $${alert.value.toLocaleString()}`}
                  />
                );
              })}
              {alerts.length === 0 && (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground font-mono text-xs">
                  WAITING FOR DATA STREAM...
                </div>
              )}
            </div>

            <div className="absolute top-4 left-4 p-4">
              <div className="font-mono text-xs text-muted-foreground">LATEST SCAN</div>
              <div className="font-mono text-2xl font-bold text-foreground">
                {alerts[0]?.market_question ? alerts[0].market_question.slice(0, 30) + "..." : "SCANNING..."}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Feed - The "Terminal" */}
        <Card className="bg-black/80 backdrop-blur-xl border-border/50 shadow-2xl flex flex-col overflow-hidden">
          <CardHeader className="pb-2 border-b border-white/5 bg-white/5">
            <CardTitle className="text-sm font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-500" />
              Live Intelligence Feed
            </CardTitle>
          </CardHeader>

          <Sheet>
            <CardContent className="flex-1 p-0 overflow-hidden relative">
              <ScrollArea className="h-full w-full">
                <div className="flex flex-col">
                  <AnimatePresence initial={false}>
                    {alerts.slice(0, 50).map((alert) => (
                      <SheetTrigger key={alert.id} asChild onClick={() => setSelectedAlert(alert)}>
                        <motion.button
                          initial={{ opacity: 0, x: -20, backgroundColor: "rgba(0,0,0,0)" }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                          className={cn(
                            "w-full text-left border-b border-white/5 p-3 group transition-all cursor-pointer relative overflow-hidden",
                            alert.value > 50000 && "bg-violet-500/5"
                          )}
                        >
                          {alert.value > 50000 && (
                            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-violet-500 shadow-[0_0_10px_#8b5cf6]" />
                          )}

                          <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={cn(
                                "h-5 text-[10px] px-1 font-mono border-0 rounded-sm",
                                alert.message.includes("BID")
                                  ? "bg-emerald-500/10 text-emerald-500"
                                  : "bg-rose-500/10 text-rose-500"
                              )}>
                                {alert.message.includes("BID") ? 'BID' : 'ASK'}
                              </Badge>
                              <span className="font-mono text-[10px] text-muted-foreground">{alert.time}</span>
                            </div>
                            <span className={cn(
                              "font-mono text-xs font-bold",
                              alert.value > 50000 ? "text-violet-400" : "text-muted-foreground"
                            )}>
                              ${(alert.value / 1000).toFixed(1)}k
                            </span>
                          </div>

                          <div className="font-mono text-xs text-foreground/90 truncate w-full group-hover:text-primary transition-colors">
                            {alert.market_question}
                          </div>

                          <div className="flex justify-between items-center mt-2 opacity-60 group-hover:opacity-100 transition-opacity">
                            <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                              {alert.message.includes("BID") ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                              {alert.price.toFixed(2)}¢
                            </div>
                            <div className="text-[10px] text-muted-foreground uppercase">
                              {alert.type}
                            </div>
                          </div>
                        </motion.button>
                      </SheetTrigger>
                    ))}
                  </AnimatePresence>

                  {alerts.length === 0 && !isLoading && (
                    <div className="p-8 text-center text-muted-foreground font-mono text-xs">
                      WAITING FOR SIGNALS...
                    </div>
                  )}

                  {isLoading && alerts.length === 0 && (
                    <div className="p-8 text-center text-primary font-mono text-xs animate-pulse">
                      ESTABLISHING UPLINK...
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Scanline Effect */}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-20 opacity-20" />
            </CardContent>

            {/* Detail Panel */}
            <SheetContent className="w-[400px] border-l border-border/50 bg-black/95 backdrop-blur-xl p-0">
              {selectedAlert && (
                <div className="h-full flex flex-col">
                  <SheetHeader className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="font-mono bg-primary/20 text-primary border-primary/50">
                        ID: {selectedAlert.id.slice(0, 8)}
                      </Badge>
                      <Badge variant="outline" className="font-mono">
                        {selectedAlert.time} UTC
                      </Badge>
                    </div>
                    <SheetTitle className="text-xl font-bold font-mono tracking-tight text-white">
                      {selectedAlert.market_question}
                    </SheetTitle>
                    <SheetDescription className="text-muted-foreground font-mono text-xs mt-2">
                      {selectedAlert.market_slug}
                    </SheetDescription>
                  </SheetHeader>

                  <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                      <DetailItem label="TYPE" value={selectedAlert.message.includes("BID") ? "BUY ORDER" : "SELL ORDER"} />
                      <DetailItem label="SIZE" value={`$${selectedAlert.value.toLocaleString()}`} highlight />
                      <DetailItem label="PRICE" value={`${selectedAlert.price.toFixed(2)}¢`} />
                      <DetailItem label="SEVERITY" value={selectedAlert.severity.toUpperCase()} />
                    </div>

                    <div className="p-4 bg-white/5 rounded-md border border-white/10">
                      <div className="text-xs font-mono text-muted-foreground mb-2">FULL MESSAGE</div>
                      <p className="font-mono text-sm text-foreground">{selectedAlert.message}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Intelligence Links</div>
                      <Button
                        variant="outline"
                        className="w-full justify-start font-mono text-xs h-10 border-white/10 hover:bg-emerald-500/20 hover:text-emerald-500 hover:border-emerald-500/50 transition-all group"
                        onClick={() => selectedAlert.market_slug && window.open(`https://polymarket.com/event/${selectedAlert.market_slug}`, '_blank')}
                      >
                        <Globe className="w-4 h-4 mr-2 opacity-50 group-hover:opacity-100" />
                        VIEW ON POLYMARKET
                        <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start font-mono text-xs h-10 border-white/10 hover:bg-[#1DA1F2]/20 hover:text-[#1DA1F2] hover:border-[#1DA1F2]/50 transition-all group"
                        onClick={() => window.open(`https://twitter.com/search?q=${encodeURIComponent(selectedAlert.market_question)}`, '_blank')}
                      >
                        <Twitter className="w-4 h-4 mr-2 opacity-50 group-hover:opacity-100" />
                        SEARCH SENTIMENT
                        <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start font-mono text-xs h-10 border-white/10 hover:bg-orange-500/20 hover:text-orange-500 hover:border-orange-500/50 transition-all group"
                        onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(selectedAlert.market_question)}`, '_blank')}
                      >
                        <Search className="w-4 h-4 mr-2 opacity-50 group-hover:opacity-100" />
                        GOOGLE NEWS SCAN
                        <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, isPositive, icon: Icon, alert = false }: any) {
  return (
    <Card className={cn(
      "bg-card/40 backdrop-blur-sm border-border/50 transition-all duration-300 hover:border-primary/50 group hover:shadow-lg",
      alert && "border-destructive/50 bg-destructive/5 hover:border-destructive animate-pulse-slow"
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{title}</span>
          <Icon className={cn(
            "w-4 h-4 transition-colors",
            alert ? "text-destructive" : "text-primary opacity-50 group-hover:opacity-100"
          )} />
        </div>
        <div className="flex items-end justify-between">
          <div className="text-2xl font-mono font-bold text-foreground tracking-tight">{value}</div>
          <Badge variant="outline" className={cn(
            "text-[10px] h-5 font-mono border-0",
            isPositive ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
          )}>
            {change}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function DetailItem({ label, value, highlight }: any) {
  return (
    <div className="space-y-1">
      <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className={cn("font-mono font-bold text-sm", highlight && "text-primary text-lg")}>
        {value}
      </div>
    </div>
  )
}
